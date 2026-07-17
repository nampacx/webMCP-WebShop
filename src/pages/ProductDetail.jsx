import { useState } from 'react'
import { useParams, useNavigate, Navigate, Link } from 'react-router-dom'
import { getProductById } from '../lib/search.js'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  const product = getProductById(id)
  if (!product) return <Navigate to="/" replace />

  const onSale = product.listPrice > product.price
  const saving = onSale ? product.listPrice - product.price : 0

  function handleAdd() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/product/${product.id}` } } })
      return
    }
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 1400)
  }

  return (
    <div className="pdp">
      <nav className="breadcrumb">
        <Link to="/">Catalog</Link>
        <span aria-hidden="true">/</span>
        <span>{product.category}</span>
        <span aria-hidden="true">/</span>
        <span className="breadcrumb-current">{product.name}</span>
      </nav>

      <div className="pdp-top">
        <div className="pdp-media" style={{ background: product.color }} aria-hidden="true">
          <span className="pdp-glyph" style={{ color: product.accent }}>
            {product.category[0]}
          </span>
          {onSale && <span className="pdp-sale-badge">Save ${saving.toFixed(2)}</span>}
        </div>

        <div className="pdp-buy">
          <p className="pdp-brand">
            {product.brand} · {product.category}
          </p>
          <h1 className="pdp-name">{product.name}</h1>

          <div className="pdp-rating">
            <span className="stars">
              {'★'.repeat(Math.round(product.rating))}
              {'☆'.repeat(5 - Math.round(product.rating))}
            </span>
            <span className="pdp-rating-text">
              {product.rating.toFixed(1)} · {product.reviewCount} reviews
            </span>
          </div>

          <p className="pdp-desc">{product.description}</p>

          <div className="pdp-price-row">
            <span className="pdp-price">${product.price.toFixed(2)}</span>
            {onSale && <span className="pdp-list-price">${product.listPrice.toFixed(2)}</span>}
          </div>

          <p className={`pdp-stock ${product.stock === 0 ? 'pdp-stock-out' : ''}`}>
            {product.stock === 0
              ? 'Out of stock'
              : product.stock < 20
                ? `Only ${product.stock} left in stock`
                : `In stock (${product.stock} available)`}
          </p>

          <div className="pdp-actions">
            <div className="cart-qty">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                −
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              className={`btn btn-primary pdp-add ${added ? 'is-added' : ''}`}
              onClick={handleAdd}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of stock' : added ? '✓ Added to cart' : 'Add to cart'}
            </button>
          </div>

          <dl className="pdp-meta">
            <div>
              <dt>SKU</dt>
              <dd>{product.sku}</dd>
            </div>
            <div>
              <dt>Warranty</dt>
              <dd>{product.warrantyMonths ? `${product.warrantyMonths} months` : 'None'}</dd>
            </div>
            <div>
              <dt>Released</dt>
              <dd>{product.releaseYear}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="pdp-info">
        <section className="pdp-section">
          <h2>Overview</h2>
          <p className="pdp-details">{product.details}</p>

          <h3>Highlights</h3>
          <ul className="pdp-features">
            {product.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>

          {product.sizes.length > 0 && (
            <>
              <h3>Available sizes</h3>
              <div className="pdp-chips">
                {product.sizes.map((s) => (
                  <span className="pdp-chip" key={s}>
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}

          <h3>Colourways</h3>
          <div className="pdp-chips">
            {product.colorways.map((c) => (
              <span className="pdp-chip" key={c}>
                {c}
              </span>
            ))}
          </div>
        </section>

        <aside className="pdp-section">
          <h2>Specifications</h2>
          <table className="pdp-specs">
            <tbody>
              {Object.entries(product.specs).map(([key, value]) => (
                <tr key={key}>
                  <th scope="row">{key}</th>
                  <td>{value}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Tags</h3>
          <div className="pdp-chips">
            {product.tags.map((t) => (
              <span className="pdp-chip pdp-chip-tag" key={t}>
                {t}
              </span>
            ))}
          </div>
        </aside>
      </div>

      <p className="pdp-note">
        Sizes and colourways are shown for demo purposes — this sample shop doesn't track variants
        in the cart.
      </p>
    </div>
  )
}
