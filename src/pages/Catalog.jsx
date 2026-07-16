import { useMemo, useState } from 'react'
import { products, categories } from '../data/products.js'
import { searchProducts } from '../lib/search.js'
import ProductCard from '../components/ProductCard.jsx'

const SORTS = {
  featured: 'Featured',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  rating: 'Top Rated',
}

export default function Catalog() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('featured')

  const filtered = useMemo(
    () => searchProducts({ query, category, sort }),
    [query, category, sort]
  )

  return (
    <div className="catalog">
      <section className="hero">
        <div className="hero-content">
          <h1>Gear up. Play harder.</h1>
          <p>
            Shop {products.length} demo products across running, football, cycling, fitness and more.
          </p>
        </div>
      </section>

      <div className="catalog-controls">
        <div className="search-box">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            placeholder="Search products, brands, categories…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery('')} aria-label="Clear search">
              ×
            </button>
          )}
        </div>

        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort products"
        >
          {Object.entries(SORTS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="category-chips">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`chip ${category === cat ? 'chip-active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="result-count">
        {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
        {query && <> matching “{query}”</>}
      </p>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No products found</p>
          <p>Try a different search term or category.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  )
}
