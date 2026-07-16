// External cart store — the single source of truth for cart contents.
// React subscribes via useSyncExternalStore; the WebMCP tools read/write it
// directly, so an agent's sequential calls (add → view) always see fresh state.

const STORAGE_KEY = 'contoso.cart.items'

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

let items = load()
const listeners = new Set()

function emit() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore persistence errors */
  }
  listeners.forEach((l) => l())
}

export const cartStore = {
  // getSnapshot: returns a stable reference until the cart actually changes.
  getItems: () => items,

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  addItem(product, quantity = 1) {
    const existing = items.find((i) => i.product.id === product.id)
    if (existing) {
      items = items.map((i) =>
        i.product.id === product.id
          ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
          : i
      )
    } else {
      items = [...items, { product, quantity: Math.min(quantity, product.stock) }]
    }
    emit()
  },

  updateQuantity(productId, quantity) {
    items = items
      .map((i) =>
        i.product.id === productId
          ? { ...i, quantity: Math.max(0, Math.min(quantity, i.product.stock)) }
          : i
      )
      .filter((i) => i.quantity > 0)
    emit()
  },

  removeItem(productId) {
    items = items.filter((i) => i.product.id !== productId)
    emit()
  },

  clear() {
    items = []
    emit()
  },
}
