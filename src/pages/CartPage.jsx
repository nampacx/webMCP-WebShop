import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

const SHIPPING_THRESHOLD = 75
const SHIPPING_FEE = 6.99
const TAX_RATE = 0.08

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal } = useCart()
  const navigate = useNavigate()

  const shipping = subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const tax = subtotal * TAX_RATE
  const total = subtotal + shipping + tax

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
              <div
                className="cart-thumb"
                style={{ background: product.color }}
                aria-hidden="true"
              >
                <span style={{ color: product.accent }}>{product.category[0]}</span>
              </div>

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
                ${(product.price * quantity).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Order summary</h2>
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
          {shipping > 0 && (
            <p className="shipping-note">
              Add ${(SHIPPING_THRESHOLD - subtotal).toFixed(2)} more for free shipping.
            </p>
          )}
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
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
