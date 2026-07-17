// The subtotal / shipping / tax / total rows shared by the cart, checkout and
// order-confirmation pages. `children` is slotted between tax and total so a
// caller can insert extra content (e.g. the cart's free-shipping note).
import { formatMoney, formatShipping } from '../lib/money.js'

export default function OrderSummary({ subtotal, shipping, tax, total, taxLabel = 'Tax', children }) {
  return (
    <>
      <div className="summary-row">
        <span>Subtotal</span>
        <span>{formatMoney(subtotal)}</span>
      </div>
      <div className="summary-row">
        <span>Shipping</span>
        <span>{formatShipping(shipping)}</span>
      </div>
      <div className="summary-row">
        <span>{taxLabel}</span>
        <span>{formatMoney(tax)}</span>
      </div>
      {children}
      <div className="summary-row summary-total">
        <span>Total</span>
        <span>{formatMoney(total)}</span>
      </div>
    </>
  )
}
