import { Link, useLocation, Navigate } from 'react-router-dom'

export default function OrderConfirmation() {
  const location = useLocation()
  const order = location.state?.order

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
          A confirmation has been “sent” to your email. This is a demo — no real order was placed.
        </p>

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
