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
import { readJSON, writeJSON, removeKey } from './safeStorage.js'
import { createStore } from './createStore.js'

const STORAGE_KEY = 'contoso.auth.user'
const PROFILE_KEY = 'contoso.profiles'

const loadOverrides = () => readJSON(PROFILE_KEY, {})
const saveOverrides = (overrides) => writeJSON(PROFILE_KEY, overrides)

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

// Re-derive the signed-in user from source rather than trusting the stored copy,
// so older persisted sessions pick up the current profile shape.
function loadUser() {
  const saved = readJSON(STORAGE_KEY, null)
  if (!saved?.id) return null
  const base = dummyUsers.find((u) => u.id === saved.id)
  if (!base) return null
  return toPublicUser(base, loadOverrides()[base.id])
}

function persistUser(user) {
  if (user) writeJSON(STORAGE_KEY, { id: user.id })
  else removeKey(STORAGE_KEY)
}

const store = createStore({ load: loadUser, persist: persistUser })

export const authStore = {
  getUser: store.getSnapshot,
  getSnapshot: store.getSnapshot,
  subscribe: store.subscribe,

  login(email, password) {
    const match = dummyUsers.find(
      (u) =>
        u.email.toLowerCase() === String(email).trim().toLowerCase() && u.password === password
    )
    if (!match) {
      return { ok: false, error: 'Invalid email or password.' }
    }
    const user = toPublicUser(match, loadOverrides()[match.id])
    store.set(user)
    return { ok: true, user }
  },

  logout() {
    store.set(null)
  },

  // Merge a partial shipping address into the signed-in user's saved address
  // and persist it. Returns { ok, shippingAddress } or { ok:false, error }.
  updateShippingAddress(patch) {
    const user = store.getSnapshot()
    if (!user) return { ok: false, error: 'Not signed in.' }

    const shippingAddress = { ...user.shippingAddress, ...patch }
    store.set({ ...user, shippingAddress })

    const overrides = loadOverrides()
    overrides[user.id] = { ...(overrides[user.id] || {}), shippingAddress }
    saveOverrides(overrides)

    return { ok: true, shippingAddress }
  },
}
