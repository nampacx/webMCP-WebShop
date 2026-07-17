// Email transports. A transport is: { name, async send(message) -> { ok, ... } }.
//
// The demo ships with two transports that never send real mail:
//   * mailboxTransport — stores the message in the in-app mailbox for preview
//   * devFileTransport — writes a real .eml file to `sent-emails/` in the repo
//     root via dev-server middleware (dev only)
//
// To send real email you would add a transport here that calls your provider
// (SendGrid/SES/SMTP relay) and register it via setTransports() in
// emailService.js. That requires a backend/API key — it is intentionally absent.

import { mailboxStore } from './mailboxStore.js'

export const mailboxTransport = {
  name: 'mailbox',
  async send(message) {
    mailboxStore.add(message)
    return { ok: true }
  },
}

export const devFileTransport = {
  name: 'dev-file',
  async send(message) {
    // The writing endpoint only exists on the Vite dev server.
    if (!import.meta.env?.DEV) return { ok: false, skipped: true, reason: 'dev-only transport' }

    const res = await fetch('/__email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
      keepalive: true,
    })
    if (!res.ok) throw new Error(`dev mail endpoint returned ${res.status}`)
    const info = await res.json().catch(() => ({}))
    return { ok: true, file: info.file }
  },
}

export const consoleTransport = {
  name: 'console',
  async send(message) {
    console.info('[email] to=%s subject=%s\n%s', message.to, message.subject, message.text)
    return { ok: true }
  },
}
