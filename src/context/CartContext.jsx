import { createContext, useContext, useMemo, useSyncExternalStore } from 'react'
import { cartStore } from '../lib/cartStore.js'
import { subtotalOf, totalItemsOf } from '../lib/pricing.js'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  // Subscribe to the external cart store. This keeps React in sync with the
  // same store the WebMCP tools mutate, so agent-driven changes re-render the UI.
  const items = useSyncExternalStore(cartStore.subscribe, cartStore.getItems)

  const { totalItems, subtotal } = useMemo(
    () => ({ totalItems: totalItemsOf(items), subtotal: subtotalOf(items) }),
    [items]
  )

  const value = {
    items,
    addToCart: cartStore.addItem,
    updateQuantity: cartStore.updateQuantity,
    removeFromCart: cartStore.removeItem,
    clearCart: cartStore.clear,
    totalItems,
    subtotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
