import { Link } from 'react-router-dom'
import { formatMoney } from '../lib/money.js'

// The profile's recent-orders list (newest first, capped at 5). Orders come
// from the audit trail — the demo's only order history.
export default function OrderHistory({ orders }) {
  if (orders.length === 0) {
    return (
      <p className="profile-hint">
        No orders yet. <Link to="/">Browse the catalog →</Link>
      </p>
    )
  }

  return (
    <ul className="order-list">
      {[...orders]
        .reverse()
        .slice(0, 5)
        .map((o) => (
          <li key={o.id}>
            <span className="order-id">{o.orderId}</span>
            <span className="order-date">{new Date(o.ts).toLocaleDateString()}</span>
            <span className="order-src">{o.source}</span>
            <span className="order-total">{formatMoney(o.total)}</span>
          </li>
        ))}
    </ul>
  )
}
