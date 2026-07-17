# Contoso Sports — Demo Webshop

A sample sports webshop built as a **React frontend only** — no backend services.
Everything (catalog, users, cart, checkout) runs client-side with static dummy data.

## Features

- **Catalog with search** — browse 17 detailed dummy products, search across every field, filter by category, and sort by price, rating, recency or review count.
- **Product detail pages** (`/product/:id`) — long description, highlights, full technical specs, available sizes and colourways, tags, SKU, warranty and release year.
- **Dummy sign-in** — sign in with a demo account (no real auth). Session persists in `localStorage`.
- **Shopping cart** — add items, change quantities, remove items. Cart persists in `localStorage`. Cart & checkout require sign-in.
- **Checkout** — shipping + payment form with validation (demo only, no real payment).
- **Order confirmation** — an order summary with a generated order number.

## Demo accounts

| Email               | Password     |
| ------------------- | ------------ |
| `demo@contoso.com`  | `contoso123` |
| `jordan@contoso.com`| `sports456`  |

(Also selectable with one click on the sign-in screen.)

## WebMCP — agent tools

The app exposes its capabilities to an in-browser agent via a **WebMCP** layer,
following the shape of the proposed `navigator.modelContext` API. Tools are
registered on the page and operate on the same state the UI uses, so agent
actions update the interface live (cart badge, pages, etc.).

Two global surfaces are installed:

- `window.navigator.modelContext` — `registerTool`, `listTools()`, `callTool(name, args)`
- `window.webmcp` — a convenience wrapper: `listTools()`, `callTool(name, args)`, `subscribe(fn)`

### Available tools

| Tool | Purpose |
| --- | --- |
| `shop_search_products` | Search/filter/sort the catalog — see below |
| `shop_get_product` | Full record for one product by id or SKU (specs, features, sizes, colourways…) |
| `shop_list_facets` | Valid categories, brands, tags, price range and sort options |
| `shop_add_to_cart` | Add a product by `productId` or SKU (+ optional `quantity`) |
| `shop_view_cart` | Return cart lines plus subtotal/shipping/tax/total |
| `shop_update_cart_item` | Set an item's quantity (0 removes it) |
| `shop_remove_from_cart` | Remove an item |
| `shop_sign_in` | Sign in with a demo account (required before checkout) |
| `shop_get_auth_status` | Report whether a user is signed in |
| `shop_checkout` | Place the order (requires sign-in + non-empty cart) |

Each tool returns an MCP-style result: `{ content: [{ type: 'text', text }], structuredContent }`.

#### Product search

`shop_search_products` free-text `query` matches **all** whitespace-separated terms (in any
order) across name, brand, category, SKU, description, details, features, specs, colourways
and tags — so `"downhill mtb helmet"` finds the DH helmet. It can be combined with filters:

| Param | Meaning |
| --- | --- |
| `query` | Free text (all terms must match) |
| `category` | One of the catalog categories, or `All` |
| `brand` | Exact brand, e.g. `Contoso` |
| `minPrice` / `maxPrice` | Price range |
| `minRating` | Minimum rating (0-5) |
| `inStockOnly` | Exclude out-of-stock |
| `onSaleOnly` | Only items where `listPrice > price` |
| `tags` | Require all tags, e.g. `["downhill","helmet"]` |
| `sort` | `featured`, `price-asc`, `price-desc`, `rating`, `newest`, `reviews` |
| `limit` | Max results (default 10) |

```js
await window.webmcp.callTool('shop_list_facets', {})                       // discover valid values
await window.webmcp.callTool('shop_search_products', { query: 'downhill mtb helmet' })
await window.webmcp.callTool('shop_search_products', { category: 'Cycling', onSaleOnly: true, sort: 'price-desc' })
await window.webmcp.callTool('shop_get_product', { productId: 'CS-CYC-003' })  // full specs
```

### Try it

From the browser devtools console:

```js
await window.webmcp.callTool('shop_search_products', { query: 'running' })
await window.webmcp.callTool('shop_add_to_cart', { productId: 'run-001' })
await window.webmcp.callTool('shop_view_cart', {})
await window.webmcp.callTool('shop_sign_in', { email: 'demo@contoso.com', password: 'contoso123' })
await window.webmcp.callTool('shop_checkout', { address: '742 Evergreen Terrace', city: 'Springfield', zip: '62704' })
```

Or click the **🤖 Agent** button (bottom-right) and hit **Run demo agent** to watch a
scripted agent search, add to cart, query the cart and check out using only these tools.

### Audit logging

Every WebMCP tool call is recorded to a persistent, client-side **audit log**
(`src/lib/auditLog.js`), so tool usage can be reviewed later. Because the app has
no backend, the log is a capped ring buffer (500 entries) kept in `localStorage`
and survives reloads. Instrumentation lives in the runtime's `callTool`, so every
call is captured regardless of caller.

- **`tool_call`** entries record: timestamp, session id, tool name, redacted args,
  `ok`/`error` status, duration (ms), and a result summary.
- **`checkout`** entries additionally record each completed order: order id, user,
  item count, total, and card last-4 — with `source: "webmcp"` (agent) or
  `source: "ui"` (checkout form), so both paths are audited.
- **Sensitive values are redacted** before storage: passwords/CVC become `••••`,
  card numbers are reduced to `•••• 1234`.

Inspect or export the trail:

```js
window.webmcp.getAuditLog()      // array of audit entries
window.webmcp.exportAuditLog()   // pretty-printed JSON string
window.webmcp.clearAuditLog()    // wipe the trail
```

The **🤖 Agent** panel also has an **Audit log** section with **Export JSON**
(downloads the trail) and **Clear** buttons.

#### Logging to a file (`audit-log.jsonl`)

A browser page can't write to disk directly, so under **`npm run dev`** each new
audit entry is also streamed to the dev server and appended to
**`audit-log.jsonl`** in the repo root (one JSON object per line). This is handled
by dev-server middleware (`auditLogFilePlugin` in `vite.config.js`) — it exists
**only during development**, so the production build (`npm run build`) stays a
pure static frontend with no backend. The file is git-ignored (it's runtime data).

```
$ cat audit-log.jsonl
{"id":"…","ts":"…","type":"tool_call","tool":"shop_search_products","args":{…},"status":"ok",…}
{"id":"…","ts":"…","type":"checkout","source":"webmcp","orderId":"CS-…","total":193.32,…}
```

## Email service (order confirmation)

After a successful checkout — from **either** the checkout form or the WebMCP
`shop_checkout` tool — an order confirmation email is composed and sent to the
signed-in user.

> **No real email is delivered.** The demo users' addresses aren't real inboxes, and
> real delivery would need a mail provider, an API key and a backend. Instead the
> service produces the actual message and delivers it through demo transports.

**Transports** (`src/lib/email/transports.js`) — a transport is
`{ name, async send(message) }`:

| Transport | What it does |
| --- | --- |
| `mailbox` | Stores the message in an in-app mailbox so it can be previewed in the UI |
| `dev-file` | Writes a real `.eml` file to `sent-emails/` in the repo root (dev only) |
| `console` | Logs the message (available, not enabled by default) |

The `.eml` files are proper RFC-822 `multipart/alternative` messages (text + HTML),
so you can double-click one and it opens in a normal mail client.

**Where you see it**
- The **order confirmation page** shows "Confirmation email sent to …" with a
  **View email** preview of the real rendered HTML.
- `sent-emails/*.eml` on disk (git-ignored runtime data).
- The audit log records an `email` entry per send (recipient, subject, message id,
  order id, and per-transport results).

**Sending real email.** Add a transport that calls your provider (SendGrid/SES/SMTP)
and register it:

```js
import { setTransports } from './lib/email/emailService.js'
setTransports([myProviderTransport])
```

That transport needs a server/API key to hold the credential — which is why it's
intentionally not included here.

```
src/lib/email/
  templates.js     renderOrderConfirmation(order, user) -> { subject, text, html }
  emailService.js  composes, dispatches through transports, writes the audit entry
  transports.js    mailbox / dev-file / console transports (plug a real one in here)
  mailboxStore.js  in-app mailbox for previewing sent messages
```

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Tech

- React 18 + React Router 6
- Vite
- React Context for auth and cart state
- Plain CSS (no UI framework)

## Project structure

```
src/
  components/     Navbar, ProductCard
  context/        AuthContext, CartContext  (subscribe to the stores below)
  data/           products.js, users.js  (static dummy data)
  lib/            cartStore, authStore  (external state shared with WebMCP)
                  pricing, search, orders  (shared logic)
                  auditLog        (persistent WebMCP tool-usage audit trail)
                  checkout.js     (post-checkout effects: audit + send email)
                  email/          (demo email service, see above)
  pages/          Catalog, ProductDetail, Login, CartPage, Checkout,
                  OrderConfirmation
  webmcp/         runtime.js      (navigator.modelContext registry)
                  tools.js        (the shop's WebMCP tool definitions)
                  WebMCPProvider  (registers tools; wires checkout navigation)
                  AgentConsole    (demo harness UI)
  styles/         index.css
  App.jsx         routes + protected routes
  main.jsx        app bootstrap
```

> **Why external stores?** The cart and auth live in plain observable stores
> (`src/lib/cartStore.js`, `src/lib/authStore.js`) that React subscribes to via
> `useSyncExternalStore`. This gives the WebMCP tools a synchronous source of
> truth, so an agent's sequential calls (e.g. add-to-cart then view-cart) always
> observe fresh, consistent state while the UI still re-renders.

> This is a demo. No real orders are placed and no data leaves your browser.
