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

export default defineConfig({
  plugins: [react(), auditLogFilePlugin()],
  server: {
    port: 5173,
    open: true,
  },
})
