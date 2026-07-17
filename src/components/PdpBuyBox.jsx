import { useState } from 'react'
import { isOnSale } from '../lib/pricing.js'
import { formatMoney } from '../lib/money.js'
import { useAddToCart } from '../hooks/useAddToCart.js'
import Stars from './Stars.jsx'

// The product detail "buy box": rating, price, stock, quantity stepper and the
// add-to-cart button. Owns its own quantity and add-to-cart state.
export default function PdpBuyBox({ product }) {
  const [quantity, setQuantity] = useState(1)
  const { added, add } = useAddToCart(product)
  const onSale = isOnSale(product)

  return (
    <div className="pdp-buy">
      <p className="pdp-brand">
        {product.brand} · {product.category}
      </p>
      <h1 className="pdp-name">{product.name}</h1>

      <div className="pdp-rating">
        <span className="stars">
          <Stars rating={product.rating} />
        </span>
        <span className="pdp-rating-text">
          {product.rating.toFixed(1)} · {product.reviewCount} reviews
        </span>
      </div>

      <p className="pdp-desc">{product.description}</p>

      <div className="pdp-price-row">
        <span className="pdp-price">{formatMoney(product.price)}</span>
        {onSale && <span className="pdp-list-price">{formatMoney(product.listPrice)}</span>}
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
          onClick={() => add(quantity)}
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
  )
}
