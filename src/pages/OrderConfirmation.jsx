import { useSyncExternalStore } from 'react'
import { Link, useLocation, Navigate } from 'react-router-dom'
import { mailboxStore } from '../lib/email/mailboxStore.js'

export default function OrderConfirmation() {
  const location = useLocation()
  const order = location.state?.order

  // The confirmation email is sent asynchronously, so subscribe to the mailbox
  // and pick it up as soon as it lands.
  const messages = useSyncExternalStore(
    (cb) => mailboxStore.subscribe(cb),
    () => mailboxStore.getMessages(),
    () => mailboxStore.getMessages()
  )
  const email = order ? messages.find((m) => m.orderId === order.orderId) : null

  // Reached directly without placing an order.
  if (!order) {
    return <Navigate to="/" replace />
  }

  const placed = new Date(order.placedAt)

  return (
    <div className="confirm-page">
      <div className="confirm-card">
        <div className="confirm-check" aria-hidden="true">✓</div>
        <h1>Thank you for your order!</h1>
        <p className="confirm-sub">
          This is a demo — no real order was placed and no real email was delivered.
        </p>

        {email ? (
          <details className="email-notice">
            <summary>
              <span className="email-icon" aria-hidden="true">✉</span>
              Confirmation email sent to <strong>{email.to}</strong>
              <span className="email-toggle">View email</span>
            </summary>
            <div className="email-preview">
              <div className="email-headers">
                <div>
                  <span>From</span>
                  {email.from}
                </div>
                <div>
                  <span>To</span>
                  {email.to}
                </div>
                <div>
                  <span>Subject</span>
                  {email.subject}
                </div>
              </div>
              <iframe
                title={`Confirmation email for ${order.orderId}`}
                className="email-frame"
                sandbox=""
                srcDoc={email.html}
              />
            </div>
          </details>
        ) : (
          <p className="email-notice email-pending">Sending confirmation email…</p>
        )}

        <div className="confirm-meta">
          <div>
            <span className="meta-label">Order number</span>
            <span className="meta-value">{order.orderId}</span>
          </div>
          <div>
            <span className="meta-label">Placed</span>
            <span className="meta-value">{placed.toLocaleString()}</span>
          </div>
          <div>
            <span className="meta-label">Paid with</span>
            <span className="meta-value">Card ending {order.cardLast4}</span>
          </div>
        </div>

        <div className="confirm-columns">
          <section>
            <h2>Items</h2>
            <ul className="confirm-items">
              {order.items.map((item, idx) => (
                <li key={idx}>
                  <span className="ci-qty">{item.quantity}×</span>
                  <span className="ci-name">{item.name}</span>
                  <span className="ci-price">${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Shipping to</h2>
            <address className="confirm-address">
              {order.shipTo.name}
              <br />
              {order.shipTo.address}
              <br />
              {order.shipTo.city}, {order.shipTo.zip}
              <br />
              {order.shipTo.country}
            </address>
          </section>
        </div>

        <div className="confirm-totals">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${order.subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{order.shipping === 0 ? 'Free' : `$${order.shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>

        <Link to="/" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
