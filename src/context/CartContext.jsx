import { createContext, useContext, useState, useEffect, useMemo } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'contoso.cart.items'

export function CartProvider({ children }) {
  // Cart is an array of { product, quantity }.
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  function addToCart(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        )
      }
      return [...prev, { product, quantity: Math.min(quantity, product.stock) }]
    })
  }

  function updateQuantity(productId, quantity) {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.max(0, Math.min(quantity, i.product.stock)) }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  function removeFromCart(productId) {
    setItems((prev) => prev.filter((i) => i.product.id !== productId))
  }

  function clearCart() {
    setItems([])
  }

  const { totalItems, subtotal } = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        acc.totalItems += i.quantity
        acc.subtotal += i.quantity * i.product.price
        return acc
      },
      { totalItems: 0, subtotal: 0 }
    )
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
