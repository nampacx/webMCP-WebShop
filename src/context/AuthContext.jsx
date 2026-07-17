import { createContext, useContext, useSyncExternalStore } from 'react'
import { authStore } from '../lib/authStore.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Subscribe to the external auth store, shared with the WebMCP tools.
  const user = useSyncExternalStore(authStore.subscribe, authStore.getUser)

  const value = {
    user,
    isAuthenticated: !!user,
    login: authStore.login,
    logout: authStore.logout,
    updateShippingAddress: authStore.updateShippingAddress,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
