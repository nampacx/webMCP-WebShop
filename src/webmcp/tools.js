// WebMCP tool definitions for the Contoso Sports shop.
//
// These operate directly on the shared cart/auth stores (not React state), so
// an agent making sequential calls always observes fresh, consistent state.
// Each tool returns an MCP-style result: { content: [...], structuredContent }.

import { products } from '../data/products.js'
import { categories } from '../data/products.js'
import { searchProducts } from '../lib/search.js'
import { cartStore } from '../lib/cartStore.js'
import { authStore } from '../lib/authStore.js'
import { subtotalOf, totalItemsOf, computeTotals } from '../lib/pricing.js'
import { buildOrder } from '../lib/orders.js'

const round = (n) => Math.round(n * 100) / 100

function ok(structuredContent, text) {
  return {
    content: [{ type: 'text', text: text ?? JSON.stringify(structuredContent) }],
    structuredContent,
  }
}

function fail(text) {
  return { content: [{ type: 'text', text }], isError: true }
}

// Shared snapshot of the cart used by several tools.
function cartSummary() {
  const items = cartStore.getItems()
  const subtotal = subtotalOf(items)
  const { shipping, tax, total } = computeTotals(subtotal)
  return {
    items: items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      quantity: i.quantity,
      unitPrice: i.product.price,
      lineTotal: round(i.product.price * i.quantity),
    })),
    totalItems: totalItemsOf(items),
    subtotal: round(subtotal),
    shipping: round(shipping),
    tax: round(tax),
    total: round(total),
  }
}

function publicProduct(p) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    price: p.price,
    rating: p.rating,
    stock: p.stock,
    description: p.description,
  }
}

// Factory so the checkout tool can trigger UI navigation via an injected callback.
export function createShopTools({ onCheckout } = {}) {
  return [
    {
      name: 'shop_search_products',
      description:
        'Search the Contoso Sports catalog. Filter by free-text query and/or category, optionally sort, and limit results. Returns matching products with their id, price and stock.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Free-text search over name, brand, category and description.',
          },
          category: {
            type: 'string',
            enum: categories,
            description: 'Restrict to a category. "All" (default) means no restriction.',
          },
          sort: {
            type: 'string',
            enum: ['featured', 'price-asc', 'price-desc', 'rating'],
            description: 'Result ordering. Defaults to "featured".',
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 50,
            description: 'Maximum number of products to return (default 10).',
          },
        },
      },
      execute({ query = '', category = 'All', sort = 'featured', limit = 10 }) {
        const all = searchProducts({ query, category, sort })
        const results = all.slice(0, limit).map(publicProduct)
        return ok(
          { count: all.length, returned: results.length, products: results },
          `Found ${all.length} product(s)` +
            (results.length ? `; top result: ${results[0].name} ($${results[0].price}).` : '.')
        )
      },
    },

    {
      name: 'shop_add_to_cart',
      description:
        'Add a product to the shopping cart by its productId (from shop_search_products). Returns the updated cart summary.',
      inputSchema: {
        type: 'object',
        properties: {
          productId: { type: 'string', description: 'The product id, e.g. "run-001".' },
          quantity: {
            type: 'integer',
            minimum: 1,
            description: 'How many to add (default 1). Capped at available stock.',
          },
        },
        required: ['productId'],
      },
      execute({ productId, quantity = 1 }) {
        const product = products.find((p) => p.id === productId)
        if (!product) return fail(`No product found with id "${productId}".`)
        if (product.stock === 0) return fail(`"${product.name}" is out of stock.`)
        cartStore.addItem(product, Math.max(1, quantity))
        const summary = cartSummary()
        return ok(
          summary,
          `Added ${quantity}× ${product.name}. Cart now has ${summary.totalItems} item(s), total $${summary.total}.`
        )
      },
    },

    {
      name: 'shop_view_cart',
      description:
        'Return the current cart contents with per-line totals plus subtotal, shipping, tax and grand total.',
      inputSchema: { type: 'object', properties: {} },
      execute() {
        const summary = cartSummary()
        if (summary.items.length === 0) return ok(summary, 'The cart is empty.')
        return ok(
          summary,
          `Cart has ${summary.totalItems} item(s). Subtotal $${summary.subtotal}, total $${summary.total}.`
        )
      },
    },

    {
      name: 'shop_update_cart_item',
      description:
        'Set the quantity of a product already in the cart. A quantity of 0 removes it. Returns the updated cart summary.',
      inputSchema: {
        type: 'object',
        properties: {
          productId: { type: 'string' },
          quantity: { type: 'integer', minimum: 0 },
        },
        required: ['productId', 'quantity'],
      },
      execute({ productId, quantity }) {
        const inCart = cartStore.getItems().some((i) => i.product.id === productId)
        if (!inCart) return fail(`Product "${productId}" is not in the cart.`)
        cartStore.updateQuantity(productId, quantity)
        return ok(cartSummary(), `Updated quantity for "${productId}" to ${quantity}.`)
      },
    },

    {
      name: 'shop_remove_from_cart',
      description: 'Remove a product from the cart entirely. Returns the updated cart summary.',
      inputSchema: {
        type: 'object',
        properties: { productId: { type: 'string' } },
        required: ['productId'],
      },
      execute({ productId }) {
        cartStore.removeItem(productId)
        return ok(cartSummary(), `Removed "${productId}" from the cart.`)
      },
    },

    {
      name: 'shop_sign_in',
      description:
        'Sign in with a demo account. Required before checkout. Demo accounts: demo@contoso.com / contoso123, jordan@contoso.com / sports456.',
      inputSchema: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
        },
        required: ['email', 'password'],
      },
      execute({ email, password }) {
        const result = authStore.login(email, password)
        if (!result.ok) return fail(result.error)
        return ok(
          { signedIn: true, user: result.user },
          `Signed in as ${result.user.name} (${result.user.email}).`
        )
      },
    },

    {
      name: 'shop_get_auth_status',
      description: 'Return whether a user is currently signed in, and who.',
      inputSchema: { type: 'object', properties: {} },
      execute() {
        const user = authStore.getUser()
        return ok(
          { signedIn: !!user, user: user || null },
          user ? `Signed in as ${user.name}.` : 'Not signed in.'
        )
      },
    },

    {
      name: 'shop_checkout',
      description:
        'Place the order for the current cart. Requires being signed in (call shop_sign_in first) and a non-empty cart. Provide a shipping address. This is a demo — no real payment is taken; card details are optional and default to a demo card. Returns the order confirmation.',
      inputSchema: {
        type: 'object',
        properties: {
          fullName: { type: 'string', description: 'Recipient name (defaults to the signed-in user).' },
          address: { type: 'string', description: 'Street address.' },
          city: { type: 'string' },
          zip: { type: 'string', description: 'ZIP / postal code.' },
          country: { type: 'string', description: 'Defaults to "United States".' },
          cardNumber: {
            type: 'string',
            description: 'Demo only — optional. Defaults to a demo card. Do not use real card numbers.',
          },
        },
        required: ['address', 'city', 'zip'],
      },
      execute({ fullName, address, city, zip, country, cardNumber }) {
        const user = authStore.getUser()
        if (!user) return fail('Not signed in. Call shop_sign_in before checking out.')

        const items = cartStore.getItems()
        if (items.length === 0) return fail('Cart is empty. Add items before checking out.')

        const order = buildOrder({
          items,
          shipTo: {
            name: fullName || user.name,
            address,
            city,
            zip,
            country: country || 'United States',
          },
          cardNumber: cardNumber || '4111111111111111',
        })

        cartStore.clear()
        if (typeof onCheckout === 'function') onCheckout(order)

        return ok(
          order,
          `Order ${order.orderId} placed for ${user.name}. ${order.items.length} line item(s), total $${round(
            order.total
          )}.`
        )
      },
    },
  ]
}
