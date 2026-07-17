// In-app mailbox holding messages "sent" by the demo email service, so they can
// be previewed in the UI. Built on the shared observable store.

import { readJSON, writeJSON } from '../safeStorage.js'
import { createStore } from '../createStore.js'

const STORAGE_KEY = 'contoso.mailbox'
const MAX_MESSAGES = 50

const store = createStore({
  load: () => readJSON(STORAGE_KEY, []),
  persist: (messages) => writeJSON(STORAGE_KEY, messages),
})

export const mailboxStore = {
  // getSnapshot: stable reference until the mailbox changes.
  getMessages: store.getSnapshot,
  getSnapshot: store.getSnapshot,
  subscribe: store.subscribe,

  add(message) {
    store.set((messages) => [...messages, message].slice(-MAX_MESSAGES))
  },

  findByOrderId(orderId) {
    return store.getSnapshot().find((m) => m.orderId === orderId)
  },

  clear() {
    store.set([])
  },
}
