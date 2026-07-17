import { useSyncExternalStore } from 'react'
import { mailboxStore } from '../lib/email/mailboxStore.js'
import { auditLog } from '../lib/auditLog.js'

// Subscribe a component to an external observable store. Expects the store to
// expose `subscribe` and `getSnapshot` (used as both the client and server
// snapshot). Keeps components from hand-rolling useSyncExternalStore.
export function useStore(store) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}

// The in-app mailbox of "sent" confirmation emails.
export function useMailbox() {
  return useSyncExternalStore(
    mailboxStore.subscribe,
    mailboxStore.getMessages,
    mailboxStore.getMessages
  )
}

// The WebMCP/checkout audit trail (also the demo's only order history).
export function useAuditLog() {
  return useSyncExternalStore(auditLog.subscribe, auditLog.getEntries, auditLog.getEntries)
}
