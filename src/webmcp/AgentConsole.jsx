import { useEffect, useState, useSyncExternalStore, useRef } from 'react'
import { modelContext } from './runtime.js'
import { auditLog } from '../lib/auditLog.js'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// A small demo harness that stands in for a browser agent. It calls the exact
// same window WebMCP tools an external agent would use, so it both demonstrates
// and documents the capability. Not part of the shop itself.
export default function AgentConsole() {
  const [open, setOpen] = useState(false)
  const [running, setRunning] = useState(false)
  const [log, setLog] = useState([])
  const logEndRef = useRef(null)

  const tools = useSyncExternalStore(
    (cb) => modelContext.subscribe(cb),
    () => modelContext.listTools(),
    () => modelContext.listTools()
  )

  const auditEntries = useSyncExternalStore(
    (cb) => auditLog.subscribe(cb),
    () => auditLog.getEntries(),
    () => auditLog.getEntries()
  )

  function exportAudit() {
    const blob = new Blob([auditLog.export()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contoso-audit-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log])

  function push(role, text) {
    setLog((l) => [...l, { role, text, id: l.length }])
  }

  async function call(name, args) {
    push('call', `${name}(${JSON.stringify(args)})`)
    const res = await modelContext.callTool(name, args)
    push(res.isError ? 'error' : 'result', res.content?.[0]?.text ?? JSON.stringify(res))
    return res
  }

  async function runDemo() {
    setRunning(true)
    setLog([])
    try {
      push('agent', 'Goal: buy running gear and a football, then check out.')

      let r = await call('shop_search_products', { query: 'running', limit: 3 })
      const first = r.structuredContent?.products?.[0]
      if (!first) return
      await sleep(350)

      await call('shop_add_to_cart', { productId: first.id, quantity: 1 })
      await sleep(350)

      r = await call('shop_search_products', { query: 'football', limit: 1 })
      const fb = r.structuredContent?.products?.[0]
      if (fb) {
        await call('shop_add_to_cart', { productId: fb.id })
        await sleep(350)
      }

      await call('shop_view_cart', {})
      await sleep(350)

      await call('shop_sign_in', { email: 'demo@contoso.com', password: 'contoso123' })
      await sleep(350)

      await call('shop_checkout', {
        address: '742 Evergreen Terrace',
        city: 'Springfield',
        zip: '62704',
      })
      push('agent', 'Done — order placed via WebMCP tools.')
    } finally {
      setRunning(false)
    }
  }

  if (!open) {
    return (
      <button className="agent-fab" onClick={() => setOpen(true)} aria-label="Open WebMCP agent console">
        🤖 <span>Agent</span>
      </button>
    )
  }

  return (
    <div className="agent-panel" role="dialog" aria-label="WebMCP agent console">
      <div className="agent-head">
        <div>
          <strong>WebMCP</strong>
          <span className="agent-sub">{tools.length} tools on window.navigator.modelContext</span>
        </div>
        <button className="agent-close" onClick={() => setOpen(false)} aria-label="Close">
          ×
        </button>
      </div>

      <div className="agent-actions">
        <button className="btn btn-primary btn-block" onClick={runDemo} disabled={running}>
          {running ? 'Agent running…' : '▶ Run demo agent'}
        </button>
      </div>

      <div className="agent-log">
        {log.length === 0 && (
          <p className="agent-empty">
            Runs a scripted agent that searches, adds to cart, queries the cart and checks out —
            using only the WebMCP tools. Watch the cart badge and page update live.
          </p>
        )}
        {log.map((entry) => (
          <div key={entry.id} className={`agent-line agent-${entry.role}`}>
            <span className="agent-role">{entry.role}</span>
            <span className="agent-text">{entry.text}</span>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>

      <details className="agent-tools">
        <summary>Available tools ({tools.length})</summary>
        <ul>
          {tools.map((t) => (
            <li key={t.name}>
              <code>{t.name}</code>
              <span>{t.description}</span>
            </li>
          ))}
        </ul>
      </details>

      <details className="agent-tools agent-audit">
        <summary>Audit log ({auditEntries.length})</summary>
        <div className="audit-actions">
          <button className="btn btn-ghost" onClick={exportAudit} disabled={auditEntries.length === 0}>
            Export JSON
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => auditLog.clear()}
            disabled={auditEntries.length === 0}
          >
            Clear
          </button>
        </div>
        <ul className="audit-list">
          {auditEntries.length === 0 && <li className="audit-empty">No activity recorded yet.</li>}
          {auditEntries
            .slice(-30)
            .reverse()
            .map((e) => (
              <li key={e.id} className={`audit-row audit-${e.status || e.type}`}>
                <span className="audit-time">{new Date(e.ts).toLocaleTimeString()}</span>
                <span className="audit-name">
                  {e.type === 'checkout' ? `✔ checkout (${e.source})` : e.tool}
                  {e.status === 'error' && <span className="audit-flag">error</span>}
                </span>
                <span className="audit-summary">{e.summary}</span>
              </li>
            ))}
        </ul>
      </details>
    </div>
  )
}
