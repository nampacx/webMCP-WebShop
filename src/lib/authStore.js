// External auth store — single source of truth for the signed-in user.
// Shared by React (useSyncExternalStore) and the WebMCP `shop_sign_in` /
// `shop_checkout` tools so auth checks are synchronous and consistent.

import { dummyUsers } from '../data/users.js'

const STORAGE_KEY = 'contoso.auth.user'

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : null
  } catch {
    return null
  }
}

let user = load()
const listeners = new Set()

function emit() {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore persistence errors */
  }
  listeners.forEach((l) => l())
}

export const authStore = {
  getUser: () => user,

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  login(email, password) {
    const match = dummyUsers.find(
      (u) =>
        u.email.toLowerCase() === String(email).trim().toLowerCase() && u.password === password
    )
    if (!match) {
      return { ok: false, error: 'Invalid email or password.' }
    }
    user = { id: match.id, email: match.email, name: match.name }
    emit()
    return { ok: true, user }
  },

  logout() {
    user = null
    emit()
  },
}
