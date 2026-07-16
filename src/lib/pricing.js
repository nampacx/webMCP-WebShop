// Shared pricing rules used by the cart, checkout, and the WebMCP tools
// so there is a single source of truth for totals.

export const SHIPPING_THRESHOLD = 75
export const SHIPPING_FEE = 6.99
export const TAX_RATE = 0.08

export function subtotalOf(items) {
  return items.reduce((sum, i) => sum + i.product.price * i.quantity, 0)
}

export function totalItemsOf(items) {
  return items.reduce((sum, i) => sum + i.quantity, 0)
}

// Given a subtotal, derive shipping / tax / grand total.
export function computeTotals(subtotal) {
  const shipping = subtotal === 0 || subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const tax = subtotal * TAX_RATE
  return { shipping, tax, total: subtotal + shipping + tax }
}
