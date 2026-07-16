import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { modelContext } from './runtime.js'
import { createShopTools } from './tools.js'

// Registers the shop's WebMCP tools with the in-page runtime on mount.
// Renders nothing. Kept inside the Router so checkout can navigate the UI to
// the order-confirmation page when an agent completes a purchase.
export default function WebMCPProvider() {
  const navigate = useNavigate()
  const navRef = useRef(navigate)
  navRef.current = navigate

  useEffect(() => {
    const tools = createShopTools({
      onCheckout: (order) => navRef.current('/order-confirmation', { state: { order } }),
    })
    const unregister = modelContext.registerTools(tools)
    return unregister
  }, [])

  return null
}
