// Minimal WebMCP runtime.
//
// Exposes an in-page tool registry that a browser agent can discover and call,
// following the shape of the proposed `navigator.modelContext` WebMCP API.
// Tools are registered by the page (see WebMCPProvider) and invoked by an agent.
//
// Two surfaces are installed on `window`:
//   * window.navigator.modelContext  — the proposed standard surface
//   * window.webmcp                   — a small convenience wrapper (listTools/callTool)
//
// Every tool call is recorded to the audit log (see src/lib/auditLog.js).

import { auditLog, redactArgs } from '../lib/auditLog.js'
import { fail } from './toolHelpers.js'

const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now())

class WebModelContext {
  #tools = new Map()
  #listeners = new Set()
  // Cached descriptor list. Regenerated only when the tool set changes so
  // useSyncExternalStore gets a stable reference between renders.
  #snapshot = []

  // Groups all tool calls from a single page load together in the audit trail.
  sessionId = Math.random().toString(36).slice(2, 10)

  constructor() {
    // Bind public methods so they keep working when destructured, e.g.
    // `const { callTool } = navigator.modelContext`.
    this.registerTool = this.registerTool.bind(this)
    this.registerTools = this.registerTools.bind(this)
    this.listTools = this.listTools.bind(this)
    this.callTool = this.callTool.bind(this)
    this.subscribe = this.subscribe.bind(this)
  }

  // Register a tool: { name, description, inputSchema, execute(args) }.
  // Returns an unregister function.
  registerTool(tool) {
    if (!tool || typeof tool.name !== 'string' || typeof tool.execute !== 'function') {
      throw new Error('registerTool requires { name, execute }')
    }
    this.#tools.set(tool.name, tool)
    this.#notify()
    return () => {
      if (this.#tools.get(tool.name) === tool) {
        this.#tools.delete(tool.name)
        this.#notify()
      }
    }
  }

  // Register several tools at once; returns a single unregister function.
  registerTools(tools) {
    const unregs = tools.map((t) => this.registerTool(t))
    return () => unregs.forEach((u) => u())
  }

  // Agent-facing tool descriptors (no handlers). Returns a cached, stable
  // reference so it is safe as a useSyncExternalStore snapshot.
  listTools() {
    return this.#snapshot
  }

  // Invoke a tool. Always resolves to an MCP-style result object; handled
  // errors come back as { content, isError: true } rather than throwing.
  // Every invocation is recorded to the audit log.
  async callTool(name, args = {}) {
    const started = now()
    const tool = this.#tools.get(name)
    if (!tool) {
      const result = fail(`Unknown tool: ${name}`)
      this.#audit(name, args, result, started)
      return result
    }
    try {
      const result = await tool.execute(args || {})
      this.#audit(name, args, result, started)
      return result
    } catch (err) {
      const result = fail(`Error in ${name}: ${err?.message || String(err)}`)
      this.#audit(name, args, result, started)
      return result
    }
  }

  // Record a single tool call to the audit log and console.
  #audit(name, args, result, started) {
    try {
      const durationMs = Math.round(now() - started)
      const status = result?.isError ? 'error' : 'ok'
      const summary = result?.content?.[0]?.text ?? ''
      const safe = redactArgs(args)

      auditLog.log({
        type: 'tool_call',
        session: this.sessionId,
        tool: name,
        args: safe,
        status,
        durationMs,
        summary,
      })

      const label = `[webmcp] ${name} (${status}, ${durationMs}ms)`
      if (result?.isError) {
        console.warn(label, { args: safe, error: summary })
      } else {
        console.info(label, { args: safe, result: result?.structuredContent })
      }
    } catch {
      /* auditing must never break a tool call */
    }
  }

  // Notified when the tool set changes.
  subscribe(listener) {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  #notify() {
    this.#snapshot = [...this.#tools.values()].map(({ name, description, inputSchema }) => ({
      name,
      description,
      inputSchema,
    }))
    this.#listeners.forEach((l) => l())
  }
}

export const modelContext = new WebModelContext()

// Install on the global surfaces so an in-browser agent can find the tools.
if (typeof window !== 'undefined') {
  try {
    Object.defineProperty(window.navigator, 'modelContext', {
      value: modelContext,
      configurable: true,
      writable: true,
    })
  } catch {
    try {
      window.navigator.modelContext = modelContext
    } catch {
      /* navigator is locked down; window.webmcp below is still available */
    }
  }

  window.webmcp = {
    listTools: () => modelContext.listTools(),
    callTool: (name, args) => modelContext.callTool(name, args),
    subscribe: (l) => modelContext.subscribe(l),
    // Audit trail accessors.
    getAuditLog: () => auditLog.getEntries(),
    exportAuditLog: () => auditLog.export(),
    clearAuditLog: () => auditLog.clear(),
    subscribeAudit: (l) => auditLog.subscribe(l),
  }
}
