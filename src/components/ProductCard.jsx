import { Link } from 'react-router-dom'
import { isOnSale } from '../lib/pricing.js'
import { formatMoney } from '../lib/money.js'
import { useAddToCart } from '../hooks/useAddToCart.js'
import Stars from './Stars.jsx'
import ProductThumb from './ProductThumb.jsx'

export default function ProductCard({ product }) {
  const { added, add } = useAddToCart(product)

  const href = `/product/${product.id}`
  const onSale = isOnSale(product)

  return (
    <article className="product-card">
      <ProductThumb
        product={product}
        as={Link}
        to={href}
        className="product-thumb"
        glyphClassName="product-glyph"
      >
        <span className="product-cat-tag">{product.category}</span>
        {onSale && <span className="product-sale-tag">Sale</span>}
      </ProductThumb>

      <div className="product-body">
        <h3 className="product-name">
          <Link to={href}>{product.name}</Link>
        </h3>
        <p className="product-brand">{product.brand}</p>
        <span className="stars" title={`${product.rating} out of 5 from ${product.reviewCount} reviews`}>
          <Stars rating={product.rating} />
          <span className="rating-value">
            {product.rating.toFixed(1)} ({product.reviewCount})
          </span>
        </span>
        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <span className="product-price-block">
            <span className="product-price">{formatMoney(product.price)}</span>
            {onSale && <span className="product-list-price">{formatMoney(product.listPrice)}</span>}
          </span>
          <button
            className={`btn btn-primary btn-add ${added ? 'is-added' : ''}`}
            onClick={() => add(1)}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of stock' : added ? '✓ Added' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  )
}
