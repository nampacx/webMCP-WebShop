import { createContext, useContext, useState, useEffect } from 'react'
import { dummyUsers } from '../data/users.js'

const AuthContext = createContext(null)

const STORAGE_KEY = 'contoso.auth.user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [user])

  // Simulated sign-in against the dummy user list.
  function login(email, password) {
    const match = dummyUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    )
    if (!match) {
      return { ok: false, error: 'Invalid email or password.' }
    }
    const publicUser = { id: match.id, email: match.email, name: match.name }
    setUser(publicUser)
    return { ok: true, user: publicUser }
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
