// External auth/profile store — single source of truth for the signed-in user.
// Shared by React (useSyncExternalStore) and the WebMCP tools so reads are
// synchronous and consistent.
//
// Two things are persisted:
//   contoso.auth.user  — who is signed in (id only is trusted; the profile is
//                        re-derived from source on load, so shape changes and
//                        data edits can't go stale)
//   contoso.profiles   — per-user edits (e.g. shipping address) so changes made
//                        in the profile page survive sign-out/sign-in

import { dummyUsers } from '../data/users.js'

const STORAGE_KEY = 'contoso.auth.user'
const PROFILE_KEY = 'contoso.profiles'

function loadOverrides() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveOverrides(overrides) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(overrides))
  } catch {
    /* ignore quota errors */
  }
}

// Build the app-facing user: source record + saved edits, minus the password.
function toPublicUser(base, override = {}) {
  const { password, ...rest } = base
  return {
    ...rest,
    ...override,
    shippingAddress: { ...base.shippingAddress, ...(override.shippingAddress || {}) },
    preferences: { ...base.preferences, ...(override.preferences || {}) },
  }
}

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!saved?.id) return null
    // Re-derive from source rather than trusting the stored copy, so older
    // persisted sessions pick up the current profile shape.
    const base = dummyUsers.find((u) => u.id === saved.id)
    if (!base) return null
    return toPublicUser(base, loadOverrides()[base.id])
  } catch {
    return null
  }
}

let user = load()
const listeners = new Set()

function emit() {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify({ id: user.id }))
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
    user = toPublicUser(match, loadOverrides()[match.id])
    emit()
    return { ok: true, user }
  },

  logout() {
    user = null
    emit()
  },

  // Merge a partial shipping address into the signed-in user's saved address
  // and persist it. Returns { ok, shippingAddress } or { ok:false, error }.
  updateShippingAddress(patch) {
    if (!user) return { ok: false, error: 'Not signed in.' }

    const shippingAddress = { ...user.shippingAddress, ...patch }
    user = { ...user, shippingAddress }

    const overrides = loadOverrides()
    overrides[user.id] = { ...(overrides[user.id] || {}), shippingAddress }
    saveOverrides(overrides)

    emit()
    return { ok: true, shippingAddress }
  },
}
