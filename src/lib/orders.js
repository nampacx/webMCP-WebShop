// Order construction shared by the Checkout page and the WebMCP checkout tool.

import { subtotalOf, computeTotals } from './pricing.js'

export function buildOrder({ items, shipTo, cardNumber }) {
  const subtotal = subtotalOf(items)
  const { shipping, tax, total } = computeTotals(subtotal)
  return {
    orderId: 'CS-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    items: items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      quantity: i.quantity,
      price: i.product.price,
    })),
    subtotal,
    shipping,
    tax,
    total,
    shipTo,
    cardLast4: String(cardNumber || '').replace(/\D/g, '').slice(-4),
    placedAt: new Date().toISOString(),
  }
}
