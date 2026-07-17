import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { getCheckoutsFor, getOrderStatsFor } from '../lib/auditLog.js'
import { formatMoney } from '../lib/money.js'
import { initials } from '../lib/text.js'
import { useAuditLog } from '../hooks/useStore.js'
import Fact from '../components/Fact.jsx'
import Toggle from '../components/Toggle.jsx'
import AddressCard from '../components/AddressCard.jsx'
import OrderHistory from '../components/OrderHistory.jsx'

export default function Profile() {
  const { user, updateShippingAddress } = useAuth()
  const { totalItems } = useCart()

  // Order history lives in the audit trail; re-read when it changes (e.g. an
  // agent checks out while this page is open).
  useAuditLog()
  const orders = getCheckoutsFor(user.email)
  const stats = getOrderStatsFor(user.email)

  return (
    <div className="profile">
      <header className="profile-head">
        <div className="profile-avatar" aria-hidden="true">
          {initials(user.name)}
        </div>
        <div className="profile-id">
          <h1>{user.name}</h1>
          <p>{user.email}</p>
        </div>
        <span className={`tier-badge tier-${user.loyaltyTier.toLowerCase()}`}>
          {user.loyaltyTier}
        </span>
      </header>

      <section className="fact-grid" aria-label="Account facts">
        <Fact label="Member since" value={new Date(user.memberSince).toLocaleDateString()} />
        <Fact label="Phone" value={user.phone} />
        <Fact label="Loyalty points" value={user.loyaltyPoints.toLocaleString()} />
        <Fact label="Orders placed" value={stats.count} />
        <Fact label="Total spent" value={formatMoney(stats.totalSpent)} />
        <Fact label="Items in cart" value={totalItems} />
      </section>

      <div className="profile-cols">
        <AddressCard address={user.shippingAddress} onSave={updateShippingAddress} />

        <section className="profile-card">
          <h2>Preferences</h2>
          <ul className="pref-list">
            <li>
              <span>Newsletter</span>
              <Toggle on={user.preferences.newsletter} />
            </li>
            <li>
              <span>SMS updates</span>
              <Toggle on={user.preferences.smsUpdates} />
            </li>
            <li>
              <span>Favourite category</span>
              <strong>{user.preferences.favouriteCategory}</strong>
            </li>
          </ul>

          <h2 className="orders-head">Recent orders</h2>
          <OrderHistory orders={orders} />
        </section>
      </div>
    </div>
  )
}
