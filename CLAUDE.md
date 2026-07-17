# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run dev        # Vite dev server on :5173 (auto-opens); enables the file-writing middleware below
npm run build      # production static build to dist/
npm run preview    # serve the built dist/
```

There is no test runner, linter, or typechecker configured — `dev`, `build`, `preview` are the only scripts.

## What this is

A **client-side-only** React demo webshop (Contoso Sports). No backend, no real auth, no real payments or email. All state (catalog, users, cart, profiles) is static dummy data in `src/data/` plus `localStorage`. The point of the project is the **WebMCP layer**: the app exposes its own capabilities as agent-callable tools following the proposed `navigator.modelContext` API.

## Architecture

### External observable stores are the source of truth (not React state)
`src/lib/cartStore.js` and `src/lib/authStore.js` are plain observable stores that persist to `localStorage`. React reads them via `useSyncExternalStore` (wrapped in `src/context/CartContext.jsx` / `AuthContext.jsx`), and the WebMCP tools read/write them **directly**. This is deliberate: it gives tools a synchronous, always-fresh source of truth so an agent's sequential calls (e.g. add-to-cart → view-cart) never observe stale state, while the UI still re-renders. When adding agent-facing behavior, mutate the store, not React state.

localStorage keys: `contoso.cart.items`, `contoso.auth.user` (stores only the user id — the profile is re-derived from `src/data/users.js` on load), `contoso.profiles` (per-user edits like shipping address, kept separately so they survive sign-out).

### WebMCP layer (`src/webmcp/`)
- `runtime.js` — the registry. Instantiates `WebModelContext` and installs it on `window.navigator.modelContext` and a convenience `window.webmcp`. **Every `callTool` is audited here** (see below), so instrumentation is caller-agnostic. Tools are `{ name, description, inputSchema, execute(args) }`; calls always resolve to an MCP-style result `{ content: [{type:'text', text}], structuredContent }` — handled errors return `{ ..., isError: true }` rather than throwing.
- `tools.js` — `createShopTools({ onCheckout })` returns the shop's tool definitions (`shop_search_products`, `shop_add_to_cart`, `shop_checkout`, etc.). These call into `src/lib/` (search, pricing, orders, cartStore, authStore), never into React.
- `WebMCPProvider.jsx` — registers the tools on mount. Lives **inside** the Router so the `shop_checkout` tool can navigate the UI to `/order-confirmation`.
- `AgentConsole.jsx` — the "🤖 Agent" panel (demo harness + audit-log UI).

### Shared checkout path
Both checkout routes — the UI form (`src/pages/Checkout.jsx`) and the `shop_checkout` tool — must run the same post-checkout side effects. They both call `finalizeCheckout()` in `src/lib/checkout.js` (audit entry + fire-and-forget confirmation email) so the two paths can't drift. Keep it that way: put any new post-order effect there, not in one caller.

### Dev-only file sinks (the only "backend")
The browser can't write files, so `vite.config.js` registers two dev-server middlewares that exist **only under `npm run dev`**:
- `auditLogFilePlugin` — `POST /__audit/log` appends each audit entry to `audit-log.jsonl` in the repo root. Browser side: `src/lib/fileSink.js` (guarded by `import.meta.env.DEV`).
- `devEmailPlugin` — `POST /__email/send` writes each message as a real RFC-822 `.eml` into `sent-emails/`.

The production build has neither endpoint and stays a pure static frontend. When touching audit or email flows, remember the browser store is the real feature and the file write is a dev-only mirror — don't make app logic depend on the endpoint existing.

### Audit log & email
- `src/lib/auditLog.js` — capped (500-entry) ring buffer in `localStorage`; redacts passwords/CVC/card numbers before storing. Exposed via `window.webmcp.getAuditLog() / exportAuditLog() / clearAuditLog()`.
- `src/lib/email/` — demo email service. `emailService.js` composes and dispatches through pluggable transports (`transports.js`: `mailbox`, `dev-file`, `console`); `templates.js` renders order confirmations; `mailboxStore.js` is the in-app preview inbox. Register a real provider via `setTransports([...])`.

## Conventions
- Plain JavaScript + JSX (no TypeScript), React 18, React Router 6, plain CSS in `src/styles/index.css`. No UI framework.
- Store/lib modules are framework-agnostic and side-effect-guarded (localStorage/fetch wrapped in try/catch) — match that when extending them.