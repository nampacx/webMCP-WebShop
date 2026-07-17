import { useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { auditLog, getCheckoutsFor, getOrderStatsFor } from '../lib/auditLog.js'

const ADDRESS_FIELDS = [
  { key: 'name', label: 'Recipient' },
  { key: 'address', label: 'Street address' },
  { key: 'city', label: 'City' },
  { key: 'zip', label: 'ZIP / Postal' },
  { key: 'country', label: 'Country' },
]

function initials(name) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function Profile() {
  const { user, updateShippingAddress } = useAuth()
  const { totalItems } = useCart()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(user.shippingAddress)
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(false)

  // Order history lives in the audit trail; re-read when it changes (e.g. an
  // agent checks out while this page is open).
  useSyncExternalStore(
    (cb) => auditLog.subscribe(cb),
    () => auditLog.getEntries(),
    () => auditLog.getEntries()
  )
  const orders = getCheckoutsFor(user.email)
  const stats = getOrderStatsFor(user.email)

  function startEdit() {
    setDraft(user.shippingAddress)
    setErrors({})
    setEditing(true)
  }

  function handleSave(e) {
    e.preventDefault()
    const next = {}
    for (const { key, label } of ADDRESS_FIELDS) {
      if (!String(draft[key] ?? '').trim()) next[key] = `${label} is required`
    }
    setErrors(next)
    if (Object.keys(next).length) return

    const result = updateShippingAddress(
      Object.fromEntries(ADDRESS_FIELDS.map(({ key }) => [key, String(draft[key]).trim()]))
    )
    if (!result.ok) {
      setErrors({ form: result.error })
      return
    }
    setEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

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
        <Fact label="Total spent" value={`$${stats.totalSpent.toFixed(2)}`} />
        <Fact label="Items in cart" value={totalItems} />
      </section>

      <div className="profile-cols">
        <section className="profile-card">
          <div className="profile-card-head">
            <h2>Shipping address</h2>
            {!editing && (
              <button className="btn btn-ghost btn-sm" onClick={startEdit}>
                Edit
              </button>
            )}
          </div>

          {saved && <p className="save-flash">✓ Shipping address updated</p>}

          {editing ? (
            <form onSubmit={handleSave} className="address-form" noValidate>
              {ADDRESS_FIELDS.map(({ key, label }) => (
                <label className={`field ${errors[key] ? 'field-error' : ''}`} key={key}>
                  <span>
                    {label}
                    {errors[key] && <em className="field-msg">{errors[key]}</em>}
                  </span>
                  <input
                    value={draft[key] ?? ''}
                    onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
                  />
                </label>
              ))}
              {errors.form && <p className="form-error">{errors.form}</p>}
              <div className="address-actions">
                <button type="submit" className="btn btn-primary">
                  Save address
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <address className="profile-address">
              {user.shippingAddress.name}
              <br />
              {user.shippingAddress.address}
              <br />
              {user.shippingAddress.city}, {user.shippingAddress.zip}
              <br />
              {user.shippingAddress.country}
            </address>
          )}
          <p className="profile-hint">Used to prefill checkout.</p>
        </section>

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
          {orders.length === 0 ? (
            <p className="profile-hint">
              No orders yet. <Link to="/">Browse the catalog →</Link>
            </p>
          ) : (
            <ul className="order-list">
              {[...orders]
                .reverse()
                .slice(0, 5)
                .map((o) => (
                  <li key={o.id}>
                    <span className="order-id">{o.orderId}</span>
                    <span className="order-date">{new Date(o.ts).toLocaleDateString()}</span>
                    <span className="order-src">{o.source}</span>
                    <span className="order-total">${o.total.toFixed(2)}</span>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function Fact({ label, value }) {
  return (
    <div className="fact">
      <span className="fact-label">{label}</span>
      <span className="fact-value">{value}</span>
    </div>
  )
}

function Toggle({ on }) {
  return <span className={`toggle ${on ? 'toggle-on' : ''}`}>{on ? 'On' : 'Off'}</span>
}
