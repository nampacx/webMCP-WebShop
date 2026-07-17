import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// Dev-only middleware: receives audit entries from the browser and appends them
// as JSON lines to `audit-log.jsonl` in the repo root. This exists only on the
// Vite dev server; the production build remains a pure static frontend.
function auditLogFilePlugin() {
  const logFile = path.resolve(import.meta.dirname, 'audit-log.jsonl')
  return {
    name: 'audit-log-file',
    configureServer(server) {
      server.middlewares.use('/__audit/log', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end()
        }
        let body = ''
        req.on('data', (chunk) => {
          body += chunk
          if (body.length > 1_000_000) req.destroy() // guard against huge payloads
        })
        req.on('end', () => {
          try {
            const entry = JSON.parse(body) // validate before writing
            fs.appendFile(logFile, JSON.stringify(entry) + '\n', () => {})
          } catch {
            /* ignore malformed payloads */
          }
          res.statusCode = 204
          res.end()
        })
      })
    },
  }
}

// Assemble an RFC-822 multipart/alternative message so the .eml opens in a
// normal mail client.
function toEml(m) {
  const boundary = '----contoso-' + Math.random().toString(36).slice(2, 12)
  return [
    `From: ${m.from}`,
    `To: ${m.to}`,
    `Subject: ${m.subject}`,
    `Date: ${new Date(m.sentAt).toUTCString()}`,
    `Message-ID: <${m.id}@contoso-sports.demo>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    m.text ?? '',
    `--${boundary}`,
    'Content-Type: text/html; charset=utf-8',
    '',
    m.html ?? '',
    `--${boundary}--`,
    '',
  ].join('\r\n')
}

// Dev-only middleware: the demo email service posts messages here and they are
// written as .eml files into `sent-emails/`. No mail is ever transmitted.
function devEmailPlugin() {
  const outDir = path.resolve(import.meta.dirname, 'sent-emails')
  return {
    name: 'dev-email',
    configureServer(server) {
      server.middlewares.use('/__email/send', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end()
        }
        let body = ''
        req.on('data', (chunk) => {
          body += chunk
          if (body.length > 5_000_000) req.destroy()
        })
        req.on('end', () => {
          try {
            const message = JSON.parse(body)
            fs.mkdirSync(outDir, { recursive: true })
            const stamp = String(message.sentAt).replace(/[:.]/g, '-')
            const safeOrder = String(message.orderId || 'no-order').replace(/[^\w-]/g, '')
            const file = `${stamp}_${safeOrder}.eml`
            fs.writeFileSync(path.join(outDir, file), toEml(message), 'utf8')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ file: `sent-emails/${file}` }))
          } catch (err) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: String(err?.message || err) }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), auditLogFilePlugin(), devEmailPlugin()],
  server: {
    port: 5173,
    open: true,
  },
})
