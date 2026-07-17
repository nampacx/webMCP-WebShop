import { Link, useLocation, Navigate } from 'react-router-dom'
import { formatMoney, lineTotal } from '../lib/money.js'
import { useMailbox } from '../hooks/useStore.js'
import OrderSummary from '../components/OrderSummary.jsx'
import AddressBlock from '../components/AddressBlock.jsx'

export default function OrderConfirmation() {
  const location = useLocation()
  const order = location.state?.order

  // The confirmation email is sent asynchronously, so subscribe to the mailbox
  // and pick it up as soon as it lands.
  const messages = useMailbox()
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
                  <span className="ci-price">{formatMoney(lineTotal(item))}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2>Shipping to</h2>
            <AddressBlock address={order.shipTo} className="confirm-address" />
          </section>
        </div>

        <div className="confirm-totals">
          <OrderSummary
            subtotal={order.subtotal}
            shipping={order.shipping}
            tax={order.tax}
            total={order.total}
          />
        </div>

        <Link to="/" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    </div>
  )
}
