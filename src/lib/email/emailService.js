// Email service: composes transactional mail and dispatches it through the
// configured transports, recording the result in the audit log.
//
// NOTE: this is a demo service — no real email is delivered. See transports.js
// for where a real provider (SendGrid/SES/SMTP) would be plugged in.

import { auditLog } from '../auditLog.js'
import { renderOrderConfirmation } from './templates.js'
import { mailboxTransport, devFileTransport } from './transports.js'

export const FROM_ADDRESS = 'Contoso Sports <no-reply@contoso-sports.demo>'

let transports = [mailboxTransport, devFileTransport]

// Swap transports (e.g. to register a real provider, or in tests).
export function setTransports(list) {
  transports = list
}

export function getTransports() {
  return transports
}

// Send the order confirmation to the customer. Returns { ok, message, results }.
// Never throws — a mail failure must not break checkout.
export async function sendOrderConfirmation(order, user) {
  const to = user?.email
  if (!to) {
    return { ok: false, error: 'No recipient address for order ' + order?.orderId }
  }

  const { subject, text, html } = renderOrderConfirmation(order, user)
  const message = {
    id: 'msg-' + Math.random().toString(36).slice(2, 10),
    from: FROM_ADDRESS,
    to,
    subject,
    text,
    html,
    orderId: order.orderId,
    sentAt: new Date().toISOString(),
  }

  const results = []
  for (const transport of transports) {
    try {
      const result = await transport.send(message)
      results.push({ transport: transport.name, ...result })
    } catch (err) {
      results.push({ transport: transport.name, ok: false, error: err?.message || String(err) })
    }
  }

  const ok = results.some((r) => r.ok)

  auditLog.log({
    type: 'email',
    event: 'order_confirmation',
    status: ok ? 'ok' : 'error',
    to,
    subject,
    messageId: message.id,
    orderId: order.orderId,
    transports: results.map((r) => ({ name: r.transport, ok: !!r.ok, ...(r.file && { file: r.file }) })),
    summary: `Order confirmation email ${ok ? 'sent' : 'FAILED'} to ${to} for order ${order.orderId}`,
  })

  return { ok, message, results }
}
