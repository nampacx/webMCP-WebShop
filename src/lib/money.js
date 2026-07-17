// Shared money helpers — the single source of truth for rounding and
// formatting currency, used by the UI, the WebMCP tools and the email template
// so every surface shows the same value the same way.

// Round to whole cents. Replaces the `Math.round(n * 100) / 100` idiom that was
// inlined in several modules.
export function roundMoney(n) {
  return Math.round(Number(n) * 100) / 100
}

// Format as a dollar amount, e.g. 12.5 -> "$12.50". Defensive about non-number
// input (some callers pass values that could be undefined).
export function formatMoney(n) {
  return `$${Number(n).toFixed(2)}`
}

// Shipping is shown as "Free" when it is zero, otherwise a money amount.
export function formatShipping(shipping) {
  return shipping === 0 ? 'Free' : formatMoney(shipping)
}

// The total price for a single cart/order line. Accepts either a cart item
// ({ product: { price }, quantity }) or a flattened order line ({ price,
// quantity }), so callers with either shape can use it.
export function lineTotal(item) {
  const price = item.product ? item.product.price : item.price
  return roundMoney(price * item.quantity)
}
