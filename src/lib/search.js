// Shared catalog search/filter/sort used by both the Catalog page and the
// WebMCP `shop_search_products` tool, so the UI and the agent see the same results.

import { products } from '../data/products.js'

export function searchProducts({ query = '', category = 'All', sort = 'featured' } = {}) {
  const q = String(query).trim().toLowerCase()
  const cat = String(category).trim().toLowerCase()

  let list = products.filter((p) => {
    const matchesCategory = !cat || cat === 'all' || p.category.toLowerCase() === cat
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    return matchesCategory && matchesQuery
  })

  switch (sort) {
    case 'price-asc':
      list = [...list].sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      list = [...list].sort((a, b) => b.price - a.price)
      break
    case 'rating':
      list = [...list].sort((a, b) => b.rating - a.rating)
      break
    default:
      break
  }
  return list
}
