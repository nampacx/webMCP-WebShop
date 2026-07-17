// A minimal observable store shared by the app's external stores (cart, auth,
// mailbox, audit log). Holds one value, notifies listeners when it changes, and
// exposes a reference-stable snapshot for React's useSyncExternalStore.
//
//   createStore({ load, persist })
//     load()         -> the initial value (e.g. read from storage)
//     persist(value) -> run after each change (e.g. write to storage)
//   returns { getSnapshot, subscribe, set, get }
//
// IMPORTANT: getSnapshot returns the current value by reference and only changes
// when `set` assigns a new one, so callers must update immutably (return a fresh
// array/object from the updater). This is what keeps useSyncExternalStore from
// looping.
export function createStore({ load, persist } = {}) {
  let value = load ? load() : undefined
  const listeners = new Set()

  return {
    get: () => value,
    getSnapshot: () => value,

    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },

    // Replace the value (pass a value or an updater fn), persist, then notify.
    set(next) {
      value = typeof next === 'function' ? next(value) : next
      if (persist) persist(value)
      listeners.forEach((l) => l())
    },
  }
}
