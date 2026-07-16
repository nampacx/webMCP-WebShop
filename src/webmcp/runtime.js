// Minimal WebMCP runtime.
//
// Exposes an in-page tool registry that a browser agent can discover and call,
// following the shape of the proposed `navigator.modelContext` WebMCP API.
// Tools are registered by the page (see WebMCPProvider) and invoked by an agent.
//
// Two surfaces are installed on `window`:
//   * window.navigator.modelContext  — the proposed standard surface
//   * window.webmcp                   — a small convenience wrapper (listTools/callTool)

class WebModelContext {
  #tools = new Map()
  #listeners = new Set()
  // Cached descriptor list. Regenerated only when the tool set changes so
  // useSyncExternalStore gets a stable reference between renders.
  #snapshot = []

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
  async callTool(name, args = {}) {
    const tool = this.#tools.get(name)
    if (!tool) {
      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true }
    }
    try {
      return await tool.execute(args || {})
    } catch (err) {
      return {
        content: [{ type: 'text', text: `Error in ${name}: ${err?.message || String(err)}` }],
        isError: true,
      }
    }
  }

  // Notified when the tool set changes (used by the demo Agent Console UI).
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
  }
}
