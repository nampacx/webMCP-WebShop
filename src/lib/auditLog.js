// Client-side audit log for WebMCP tool usage and checkouts.
//
// The app has no backend, so the audit trail is persisted to localStorage as a
// capped ring buffer that survives reloads. Every WebMCP tool call is recorded
// centrally by the runtime; checkouts get an additional, richer event.
//
// Sensitive values (passwords, card numbers, CVC) are redacted before storage.

const STORAGE_KEY = 'contoso.audit.log'
const MAX_ENTRIES = 500

const norm = (k) => String(k).toLowerCase().replace(/[^a-z0-9]/g, '')
const FULL_MASK = new Set(['password', 'cvc', 'cvv', 'cardcvc'])
const CARD_KEYS = new Set(['cardnumber', 'card', 'pan'])

// Redact sensitive fields from tool arguments before they are logged.
export function redactArgs(value) {
  if (Array.isArray(value)) return value.map(redactArgs)
  if (!value || typeof value !== 'object') return value

  const out = {}
  for (const [key, val] of Object.entries(value)) {
    const nk = norm(key)
    if (FULL_MASK.has(nk)) {
      out[key] = '••••'
    } else if (CARD_KEYS.has(nk) && typeof val === 'string') {
      const digits = val.replace(/\D/g, '')
      out[key] = digits ? `•••• ${digits.slice(-4)}` : '••••'
    } else if (val && typeof val === 'object') {
      out[key] = redactArgs(val)
    } else {
      out[key] = val
    }
  }
  return out
}

function load() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

let entries = load()
let seq = 0
const listeners = new Set()
// Fired only when a genuinely new entry is appended (not on reload/clear).
// Used by the file sink so historical localStorage entries aren't re-shipped.
const appendListeners = new Set()

function emit() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    /* ignore persistence errors (e.g. quota) */
  }
  listeners.forEach((l) => l())
}

export const auditLog = {
  // getSnapshot: stable reference until the log changes.
  getEntries: () => entries,

  subscribe(listener) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },

  // Notified with each newly appended entry (for the file sink).
  onAppend(listener) {
    appendListeners.add(listener)
    return () => appendListeners.delete(listener)
  },

  // Append an entry. Callers provide the domain fields; id/timestamp are added.
  log(entry) {
    const full = {
      id: `${Date.now().toString(36)}-${(seq++).toString(36)}`,
      ts: new Date().toISOString(),
      ...entry,
    }
    entries = [...entries, full].slice(-MAX_ENTRIES)
    emit()
    appendListeners.forEach((l) => {
      try {
        l(full)
      } catch {
        /* a sink failure must not break logging */
      }
    })
    return full
  },

  clear() {
    entries = []
    emit()
  },

  export() {
    return JSON.stringify(entries, null, 2)
  },
}

// Checkout events recorded for a given user, oldest first. The audit trail is
// the only order history this backend-less demo has.
export function getCheckoutsFor(email) {
  if (!email) return []
  return entries.filter((e) => e.type === 'checkout' && e.user === email)
}

// Aggregate order facts for a user: how many orders and how much spent.
export function getOrderStatsFor(email) {
  const orders = getCheckoutsFor(email)
  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0)
  return {
    count: orders.length,
    totalSpent: Math.round(totalSpent * 100) / 100,
    lastOrderId: orders.length ? orders[orders.length - 1].orderId : null,
    lastOrderAt: orders.length ? orders[orders.length - 1].ts : null,
  }
}

// Record a completed checkout as a distinct business event. `source` is where
// the checkout was initiated from: "webmcp" (agent tool) or "ui" (checkout form).
export function logCheckout(order, { source = 'unknown', user = null } = {}) {
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0)
  const entry = auditLog.log({
    type: 'checkout',
    source,
    orderId: order.orderId,
    user,
    lineItems: order.items.length,
    itemCount,
    total: Math.round(order.total * 100) / 100,
    cardLast4: order.cardLast4,
    summary: `Order ${order.orderId} placed via ${source} — ${order.items.length} line item(s), total $${order.total.toFixed(
      2
    )}`,
  })
  try {
    console.info('[webmcp:audit] checkout', entry)
  } catch {
    /* no-op */
  }
  return entry
}
