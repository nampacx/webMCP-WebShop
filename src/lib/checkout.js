// Post-checkout side effects, shared by both checkout paths (the WebMCP
// shop_checkout tool and the UI checkout form) so they can't drift apart.

import { logCheckout } from './auditLog.js'
import { sendOrderConfirmation } from './email/emailService.js'

// Record the order in the audit trail and send the confirmation email.
// `source` is "webmcp" (agent) or "ui" (checkout form).
// The email is fire-and-forget: it must never block or break the confirmation.
export function finalizeCheckout(order, { source, user }) {
  logCheckout(order, { source, user: user?.email })
  return sendOrderConfirmation(order, user).catch((err) => {
    console.warn('[email] order confirmation failed', err)
    return { ok: false, error: String(err) }
  })
}
