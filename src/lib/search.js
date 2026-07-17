// Shared catalog search/filter/sort used by both the Catalog page and the
// WebMCP product tools, so the UI and the agent always see the same results.

import { products } from '../data/products.js'
import { isOnSale } from './pricing.js'

export const SORT_OPTIONS = ['featured', 'price-asc', 'price-desc', 'rating', 'newest', 'reviews']

// Everything a free-text query is matched against.
function haystack(p) {
  return [
    p.name,
    p.brand,
    p.category,
    p.sku,
    p.description,
    p.details,
    ...(p.tags || []),
    ...(p.features || []),
    ...(p.colorways || []),
    ...(p.sizes || []),
    ...Object.entries(p.specs || {}).flat(),
  ]
    .join(' ')
    .toLowerCase()
}

const num = (v) => (v === undefined || v === null || v === '' ? null : Number(v))

/**
 * Filter and sort the catalog.
 * All options are optional; unknown/blank values are ignored.
 */
export function searchProducts({
  query = '',
  category = 'All',
  brand = null,
  minPrice = null,
  maxPrice = null,
  minRating = null,
  inStockOnly = false,
  onSaleOnly = false,
  tags = null,
  sort = 'featured',
} = {}) {
  // Match every whitespace-separated term rather than the query as one literal
  // substring, so natural-language queries like "downhill mtb helmet" work.
  const terms = String(query ?? '')
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
  const cat = String(category ?? 'All').trim().toLowerCase()
  const brandFilter = brand ? String(brand).trim().toLowerCase() : null
  const min = num(minPrice)
  const max = num(maxPrice)
  const minRat = num(minRating)
  const tagList = (Array.isArray(tags) ? tags : tags ? [tags] : [])
    .map((t) => String(t).trim().toLowerCase())
    .filter(Boolean)

  let list = products.filter((p) => {
    if (cat && cat !== 'all' && p.category.toLowerCase() !== cat) return false
    if (brandFilter && p.brand.toLowerCase() !== brandFilter) return false
    if (min !== null && !Number.isNaN(min) && p.price < min) return false
    if (max !== null && !Number.isNaN(max) && p.price > max) return false
    if (minRat !== null && !Number.isNaN(minRat) && p.rating < minRat) return false
    if (inStockOnly && p.stock <= 0) return false
    if (onSaleOnly && !isOnSale(p)) return false
    if (tagList.length && !tagList.every((t) => (p.tags || []).some((pt) => pt.includes(t)))) {
      return false
    }
    if (terms.length) {
      const hay = haystack(p)
      if (!terms.every((t) => hay.includes(t))) return false
    }
    return true
  })

  switch (sort) {
    case 'price-asc':
      list = [...list].sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      list = [...list].sort((a, b) => b.price - a.price)
      break
    case 'rating':
      list = [...list].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount)
      break
    case 'newest':
      list = [...list].sort((a, b) => b.releaseYear - a.releaseYear)
      break
    case 'reviews':
      list = [...list].sort((a, b) => b.reviewCount - a.reviewCount)
      break
    default:
      break // "featured" keeps the catalog's own order
  }
  return list
}

// Look a product up by id or SKU (case-insensitive).
export function getProductById(idOrSku) {
  const key = String(idOrSku ?? '').trim().toLowerCase()
  if (!key) return undefined
  return products.find((p) => p.id.toLowerCase() === key || p.sku.toLowerCase() === key)
}

// The filter values that actually exist in the catalog — lets an agent build a
// valid query without guessing.
export function getFacets() {
  const prices = products.map((p) => p.price)
  return {
    productCount: products.length,
    categories: [...new Set(products.map((p) => p.category))].sort(),
    brands: [...new Set(products.map((p) => p.brand))].sort(),
    tags: [...new Set(products.flatMap((p) => p.tags || []))].sort(),
    priceRange: { min: Math.min(...prices), max: Math.max(...prices) },
    sortOptions: SORT_OPTIONS,
    inStockCount: products.filter((p) => p.stock > 0).length,
    onSaleCount: products.filter(isOnSale).length,
  }
}
