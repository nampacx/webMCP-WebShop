import { useParams, Navigate, Link } from 'react-router-dom'
import { getProductById } from '../lib/search.js'
import { isOnSale } from '../lib/pricing.js'
import { formatMoney } from '../lib/money.js'
import ProductThumb from '../components/ProductThumb.jsx'
import PdpBuyBox from '../components/PdpBuyBox.jsx'
import PdpInfo from '../components/PdpInfo.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const product = getProductById(id)
  if (!product) return <Navigate to="/" replace />

  const onSale = isOnSale(product)
  const saving = onSale ? product.listPrice - product.price : 0

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
        <ProductThumb
          product={product}
          className="pdp-media"
          glyphClassName="pdp-glyph"
          aria-hidden="true"
        >
          {onSale && <span className="pdp-sale-badge">Save {formatMoney(saving)}</span>}
        </ProductThumb>

        <PdpBuyBox product={product} />
      </div>

      <PdpInfo product={product} />

      <p className="pdp-note">
        Sizes and colourways are shown for demo purposes — this sample shop doesn't track variants
        in the cart.
      </p>
    </div>
  )
}
