// In-app mailbox holding messages "sent" by the demo email service, so they can
// be previewed in the UI. Same external-store pattern as cartStore/auditLog.

const STORAGE_KEY = 'contoso.mailbox'
const MAX_MESSAGES = 50

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

let messages = load()
const listeners = new Set()

function emit() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  } catch {
    /* ignore quota errors */
  }
  listeners.forEach((l) => l())
}

export const mailboxStore = {
  // getSnapshot: stable reference until the mailbox changes.
  getMessages: () => messages,

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  add(message) {
    messages = [...messages, message].slice(-MAX_MESSAGES)
    emit()
  },

  findByOrderId(orderId) {
    return messages.find((m) => m.orderId === orderId)
  },

  clear() {
    messages = []
    emit()
  },
}
