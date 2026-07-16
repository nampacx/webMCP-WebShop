import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { computeTotals } from '../lib/pricing.js'
import { buildOrder } from '../lib/orders.js'
import { logCheckout } from '../lib/auditLog.js'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: user?.name || '',
    address: '',
    city: '',
    zip: '',
    country: 'United States',
    cardName: '',
    cardNumber: '',
    expiry: '',
    cvc: '',
  })
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)

  // If cart emptied out (e.g. after placing an order), go home.
  if (items.length === 0) {
    return <Navigate to="/" replace />
  }

  const { shipping, tax, total } = computeTotals(subtotal)

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validate() {
    const e = {}
    if (!form.fullName.trim()) e.fullName = 'Required'
    if (!form.address.trim()) e.address = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!/^\d{4,10}$/.test(form.zip.trim())) e.zip = 'Enter a valid ZIP/postal code'
    if (!form.cardName.trim()) e.cardName = 'Required'
    if (!/^\d{12,19}$/.test(form.cardNumber.replace(/\s/g, ''))) e.cardNumber = 'Enter 12–19 digits'
    if (!/^\d{2}\/\d{2}$/.test(form.expiry.trim())) e.expiry = 'MM/YY'
    if (!/^\d{3,4}$/.test(form.cvc.trim())) e.cvc = '3–4 digits'
    return e
  }

  function handleSubmit(e) {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setPlacing(true)
    // Simulate a network round-trip — no real backend.
    setTimeout(() => {
      const order = buildOrder({
        items,
        shipTo: {
          name: form.fullName,
          address: form.address,
          city: form.city,
          zip: form.zip,
          country: form.country,
        },
        cardNumber: form.cardNumber,
      })
      clearCart()
      logCheckout(order, { source: 'ui', user: user?.email })
      navigate('/order-confirmation', { replace: true, state: { order } })
    }, 900)
  }

  return (
    <div className="checkout-page">
      <h1 className="page-title">Checkout</h1>

      <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
        <div className="checkout-forms">
          <fieldset className="form-section">
            <legend>Shipping address</legend>
            <Field label="Full name" error={errors.fullName}>
              <input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} />
            </Field>
            <Field label="Street address" error={errors.address}>
              <input value={form.address} onChange={(e) => update('address', e.target.value)} />
            </Field>
            <div className="form-cols">
              <Field label="City" error={errors.city}>
                <input value={form.city} onChange={(e) => update('city', e.target.value)} />
              </Field>
              <Field label="ZIP / Postal" error={errors.zip}>
                <input value={form.zip} onChange={(e) => update('zip', e.target.value)} />
              </Field>
            </div>
            <Field label="Country" error={errors.country}>
              <select value={form.country} onChange={(e) => update('country', e.target.value)}>
                <option>United States</option>
                <option>Canada</option>
                <option>United Kingdom</option>
                <option>Germany</option>
                <option>Australia</option>
              </select>
            </Field>
          </fieldset>

          <fieldset className="form-section">
            <legend>Payment</legend>
            <p className="demo-note">
              Demo only — do not enter real card details. Any 12–19 digit number is accepted.
            </p>
            <Field label="Name on card" error={errors.cardName}>
              <input value={form.cardName} onChange={(e) => update('cardName', e.target.value)} />
            </Field>
            <Field label="Card number" error={errors.cardNumber}>
              <input
                inputMode="numeric"
                placeholder="4111 1111 1111 1111"
                value={form.cardNumber}
                onChange={(e) => update('cardNumber', e.target.value)}
              />
            </Field>
            <div className="form-cols">
              <Field label="Expiry (MM/YY)" error={errors.expiry}>
                <input placeholder="12/28" value={form.expiry} onChange={(e) => update('expiry', e.target.value)} />
              </Field>
              <Field label="CVC" error={errors.cvc}>
                <input inputMode="numeric" placeholder="123" value={form.cvc} onChange={(e) => update('cvc', e.target.value)} />
              </Field>
            </div>
          </fieldset>
        </div>

        <aside className="checkout-summary">
          <h2>Order summary</h2>
          <ul className="checkout-items">
            {items.map(({ product, quantity }) => (
              <li key={product.id}>
                <span className="ci-qty">{quantity}×</span>
                <span className="ci-name">{product.name}</span>
                <span className="ci-price">${(product.price * quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={placing}>
            {placing ? 'Placing order…' : `Place order · $${total.toFixed(2)}`}
          </button>
        </aside>
      </form>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className={`field ${error ? 'field-error' : ''}`}>
      <span>
        {label}
        {error && <em className="field-msg">{error}</em>}
      </span>
      {children}
    </label>
  )
}
