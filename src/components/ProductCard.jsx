import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

function Stars({ rating }) {
  return (
    <span className="stars" title={`${rating} out of 5`}>
      {'★'.repeat(Math.round(rating))}
      {'☆'.repeat(5 - Math.round(rating))}
      <span className="rating-value">{rating.toFixed(1)}</span>
    </span>
  )
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [added, setAdded] = useState(false)

  function handleAdd() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/' } } })
      return
    }
    addToCart(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="product-card">
      <div
        className="product-thumb"
        style={{ background: product.color }}
        aria-hidden="true"
      >
        <span className="product-glyph" style={{ color: product.accent }}>
          {product.category[0]}
        </span>
        <span className="product-cat-tag">{product.category}</span>
      </div>

      <div className="product-body">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-brand">{product.brand}</p>
        <Stars rating={product.rating} />
        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <span className="product-price">${product.price.toFixed(2)}</span>
          <button
            className={`btn btn-primary btn-add ${added ? 'is-added' : ''}`}
            onClick={handleAdd}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of stock' : added ? '✓ Added' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
