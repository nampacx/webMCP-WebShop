import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'
import { SHIPPING_THRESHOLD, computeTotals } from '../lib/pricing.js'
import { formatMoney, lineTotal } from '../lib/money.js'
import OrderSummary from '../components/OrderSummary.jsx'
import ProductThumb from '../components/ProductThumb.jsx'

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart()
  const navigate = useNavigate()

  const { shipping, tax, total } = computeTotals(subtotal)

  if (items.length === 0) {
    return (
      <div className="empty-state cart-empty">
        <p className="empty-title">Your cart is empty</p>
        <p>Looks like you haven’t added anything yet.</p>
        <Link to="/" className="btn btn-primary">
          Browse catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h1 className="page-title">Your cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map(({ product, quantity }) => (
            <div className="cart-row" key={product.id}>
              <ProductThumb product={product} className="cart-thumb" aria-hidden="true" />

              <div className="cart-info">
                <h3>{product.name}</h3>
                <p className="cart-brand">{product.brand} · {product.category}</p>
                <button className="link-danger" onClick={() => removeFromCart(product.id)}>
                  Remove
                </button>
              </div>

              <div className="cart-qty">
                <button
                  aria-label="Decrease quantity"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button
                  aria-label="Increase quantity"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <div className="cart-line-price">
                {formatMoney(lineTotal({ product, quantity }))}
              </div>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          <OrderSummary subtotal={subtotal} shipping={shipping} tax={tax} total={total} taxLabel="Tax (8%)">
            {shipping > 0 && (
              <p className="shipping-note">
                Add {formatMoney(SHIPPING_THRESHOLD - subtotal)} more for free shipping.
              </p>
            )}
          </OrderSummary>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </button>
          <Link to="/" className="continue-link">
            ← Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  )
}
