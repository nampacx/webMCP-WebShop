// Cart/order line shaping shared by the WebMCP tools and order construction, so
// the agent-facing cart summary and the persisted order describe lines the same
// way.

import { subtotalOf, totalItemsOf, computeTotals } from './pricing.js'
import { roundMoney, lineTotal } from './money.js'

// One cart item projected to a canonical order line. `price` is the unit price.
export function toOrderLine(item) {
  return {
    productId: item.product.id,
    name: item.product.name,
    quantity: item.quantity,
    price: item.product.price,
  }
}

// Full cart summary: canonical lines (each with its line total) plus rounded
// subtotal / shipping / tax / total and the item count.
export function summarizeCart(items) {
  const subtotal = subtotalOf(items)
  const { shipping, tax, total } = computeTotals(subtotal)
  return {
    items: items.map((i) => ({ ...toOrderLine(i), lineTotal: lineTotal(i) })),
    totalItems: totalItemsOf(items),
    subtotal: roundMoney(subtotal),
    shipping: roundMoney(shipping),
    tax: roundMoney(tax),
    total: roundMoney(total),
  }
}
