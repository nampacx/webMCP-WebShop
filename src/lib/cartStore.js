// External cart store — the single source of truth for cart contents.
// React subscribes via useSyncExternalStore; the WebMCP tools read/write it
// directly, so an agent's sequential calls (add → view) always see fresh state.

import { readJSON, writeJSON } from './safeStorage.js'
import { createStore } from './createStore.js'

const STORAGE_KEY = 'contoso.cart.items'

const store = createStore({
  load: () => readJSON(STORAGE_KEY, []),
  persist: (items) => writeJSON(STORAGE_KEY, items),
})

export const cartStore = {
  // getSnapshot: returns a stable reference until the cart actually changes.
  getItems: store.getSnapshot,
  getSnapshot: store.getSnapshot,
  subscribe: store.subscribe,

  addItem(product, quantity = 1) {
    store.set((items) => {
      const existing = items.find((i) => i.product.id === product.id)
      if (existing) {
        return items.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        )
      }
      return [...items, { product, quantity: Math.min(quantity, product.stock) }]
    })
  },

  updateQuantity(productId, quantity) {
    store.set((items) =>
      items
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(0, Math.min(quantity, i.product.stock)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  },

  removeItem(productId) {
    store.set((items) => items.filter((i) => i.product.id !== productId))
  },

  clear() {
    store.set([])
  },
}
