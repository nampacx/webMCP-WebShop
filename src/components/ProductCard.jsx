import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

function Stars({ rating, reviewCount }) {
  return (
    <span className="stars" title={`${rating} out of 5 from ${reviewCount} reviews`}>
      {'★'.repeat(Math.round(rating))}
      {'☆'.repeat(5 - Math.round(rating))}
      <span className="rating-value">
        {rating.toFixed(1)} ({reviewCount})
      </span>
    </span>
  )
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [added, setAdded] = useState(false)

  const href = `/product/${product.id}`
  const onSale = product.listPrice > product.price

  function handleAdd() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: href } } })
      return
    }
    addToCart(product, 1)
    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <article className="product-card">
      <Link to={href} className="product-thumb" style={{ background: product.color }}>
        <span className="product-glyph" style={{ color: product.accent }} aria-hidden="true">
          {product.category[0]}
        </span>
        <span className="product-cat-tag">{product.category}</span>
        {onSale && <span className="product-sale-tag">Sale</span>}
      </Link>

      <div className="product-body">
        <h3 className="product-name">
          <Link to={href}>{product.name}</Link>
        </h3>
        <p className="product-brand">{product.brand}</p>
        <Stars rating={product.rating} reviewCount={product.reviewCount} />
        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <span className="product-price-block">
            <span className="product-price">${product.price.toFixed(2)}</span>
            {onSale && <span className="product-list-price">${product.listPrice.toFixed(2)}</span>}
          </span>
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
