import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { computeTotals } from '../lib/pricing.js'
import { formatMoney, lineTotal } from '../lib/money.js'
import { buildOrder } from '../lib/orders.js'
import { finalizeCheckout } from '../lib/checkout.js'
import { validateAddress, validatePayment } from '../lib/validation.js'
import OrderSummary from '../components/OrderSummary.jsx'
import ShippingForm from '../components/ShippingForm.jsx'
import PaymentForm from '../components/PaymentForm.jsx'

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  // Prefill from the user's saved shipping address (editable per order).
  const [form, setForm] = useState({
    name: user?.shippingAddress?.name || user?.name || '',
    address: user?.shippingAddress?.address || '',
    city: user?.shippingAddress?.city || '',
    zip: user?.shippingAddress?.zip || '',
    country: user?.shippingAddress?.country || 'United States',
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
    return { ...validateAddress(form), ...validatePayment(form) }
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
          name: form.name,
          address: form.address,
          city: form.city,
          zip: form.zip,
          country: form.country,
        },
        cardNumber: form.cardNumber,
      })
      clearCart()
      finalizeCheckout(order, { source: 'ui', user })
      navigate('/order-confirmation', { replace: true, state: { order } })
    }, 900)
  }

  return (
    <div className="checkout-page">
      <h1 className="page-title">Checkout</h1>

      <form className="checkout-layout" onSubmit={handleSubmit} noValidate>
        <div className="checkout-forms">
          <ShippingForm form={form} errors={errors} update={update} />
          <PaymentForm form={form} errors={errors} update={update} />
        </div>

        <aside className="checkout-summary">
          <h2>Order summary</h2>
          <ul className="checkout-items">
            {items.map(({ product, quantity }) => (
              <li key={product.id}>
                <span className="ci-qty">{quantity}×</span>
                <span className="ci-name">{product.name}</span>
                <span className="ci-price">{formatMoney(lineTotal({ product, quantity }))}</span>
              </li>
            ))}
          </ul>
          <OrderSummary subtotal={subtotal} shipping={shipping} tax={tax} total={total} taxLabel="Tax (8%)" />
          <button type="submit" className="btn btn-primary btn-block" disabled={placing}>
            {placing ? 'Placing order…' : `Place order · ${formatMoney(total)}`}
          </button>
        </aside>
      </form>
    </div>
  )
}
