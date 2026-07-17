// Order confirmation email template. Produces the subject plus text and HTML
// bodies from an order. Kept transport-agnostic — see emailService.js.

import { formatMoney as money, formatShipping } from '../money.js'

export function renderOrderConfirmation(order, user) {
  const subject = `Your Contoso Sports order ${order.orderId}`
  const name = user?.name || order.shipTo?.name || 'there'
  const placed = new Date(order.placedAt).toLocaleString()

  const text = [
    `Hi ${name},`,
    '',
    `Thanks for your order! We've received it and it's being prepared.`,
    '',
    `Order number: ${order.orderId}`,
    `Placed: ${placed}`,
    `Paid with: card ending ${order.cardLast4}`,
    '',
    'Items',
    '-----',
    ...order.items.map((i) => `${i.quantity} x ${i.name} — ${money(i.price * i.quantity)}`),
    '',
    `Subtotal: ${money(order.subtotal)}`,
    `Shipping: ${formatShipping(order.shipping)}`,
    `Tax: ${money(order.tax)}`,
    `Total: ${money(order.total)}`,
    '',
    'Shipping to',
    '-----------',
    order.shipTo.name,
    order.shipTo.address,
    `${order.shipTo.city}, ${order.shipTo.zip}`,
    order.shipTo.country,
    '',
    '— Contoso Sports',
    'This is a demo message. No real order was placed and no goods will ship.',
  ].join('\n')

  const rows = order.items
    .map(
      (i) => `
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8e5;color:#5b6b64;">${i.quantity}×</td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8e5;">${i.name}</td>
          <td style="padding:8px 0;border-bottom:1px solid #e2e8e5;text-align:right;font-weight:600;">${money(
            i.price * i.quantity
          )}</td>
        </tr>`
    )
    .join('')

  const totalRow = (label, value, bold = false) => `
    <tr>
      <td colspan="2" style="padding:4px 0;color:${bold ? '#12211c' : '#5b6b64'};${
        bold ? 'font-weight:800;font-size:16px;padding-top:12px;' : ''
      }">${label}</td>
      <td style="padding:4px 0;text-align:right;color:${bold ? '#12211c' : '#5b6b64'};${
        bold ? 'font-weight:800;font-size:16px;padding-top:12px;' : ''
      }">${value}</td>
    </tr>`

  const html = `<!doctype html>
<html>
  <body style="margin:0;padding:24px;background:#f6f8f7;font-family:Segoe UI,system-ui,-apple-system,Helvetica,Arial,sans-serif;color:#12211c;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8e5;border-radius:14px;overflow:hidden;">
      <tr>
        <td style="background:#0b6b4f;padding:20px 24px;color:#ffffff;font-size:18px;font-weight:800;">
          ◈ Contoso<span style="opacity:.85;">Sports</span>
        </td>
      </tr>
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 8px;font-size:20px;">Thanks for your order, ${name}!</h1>
          <p style="margin:0 0 20px;color:#5b6b64;font-size:14px;line-height:1.5;">
            We've received your order and it's being prepared.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f8f7;border-radius:10px;padding:12px;margin-bottom:20px;font-size:13px;">
            <tr><td style="padding:4px 12px;color:#5b6b64;">Order number</td><td style="padding:4px 12px;text-align:right;font-weight:700;">${
              order.orderId
            }</td></tr>
            <tr><td style="padding:4px 12px;color:#5b6b64;">Placed</td><td style="padding:4px 12px;text-align:right;">${placed}</td></tr>
            <tr><td style="padding:4px 12px;color:#5b6b64;">Paid with</td><td style="padding:4px 12px;text-align:right;">Card ending ${
              order.cardLast4
            }</td></tr>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
            ${rows}
            ${totalRow('Subtotal', money(order.subtotal))}
            ${totalRow('Shipping', formatShipping(order.shipping))}
            ${totalRow('Tax', money(order.tax))}
            ${totalRow('Total', money(order.total), true)}
          </table>

          <h2 style="margin:24px 0 8px;font-size:14px;">Shipping to</h2>
          <p style="margin:0;color:#5b6b64;font-size:14px;line-height:1.6;">
            ${order.shipTo.name}<br />
            ${order.shipTo.address}<br />
            ${order.shipTo.city}, ${order.shipTo.zip}<br />
            ${order.shipTo.country}
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 24px;border-top:1px solid #e2e8e5;color:#5b6b64;font-size:12px;line-height:1.5;">
          This is a <strong>demo</strong> message from a sample application. No real order was
          placed, no payment was taken, and no goods will ship.
        </td>
      </tr>
    </table>
  </body>
</html>`

  return { subject, text, html }
}
