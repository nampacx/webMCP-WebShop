// Ships new audit entries to the dev server, which appends them to
// `audit-log.jsonl` in the repo root (see the audit-log-file plugin in
// vite.config.js).
//
// This only runs under `npm run dev` — the endpoint is provided by Vite
// dev-server middleware. The production build has no such endpoint, so the app
// stays a pure static frontend with no backend.

import { auditLog } from './auditLog.js'

const ENDPOINT = '/__audit/log'

export function initFileSink() {
  // Dev only: the file-writing endpoint exists solely on the Vite dev server.
  if (!import.meta.env?.DEV) return () => {}

  return auditLog.onAppend((entry) => {
    try {
      fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
        keepalive: true,
      }).catch(() => {
        /* dev server not reachable — ignore */
      })
    } catch {
      /* ignore */
    }
  })
}
