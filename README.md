# Contoso Sports — Demo Webshop

A sample sports webshop built as a **React frontend only** — no backend services.
Everything (catalog, users, cart, checkout) runs client-side with static dummy data.

## Features

- **Catalog with search** — browse 16 dummy products, search by name/brand/category/description, filter by category, and sort by price or rating.
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
| `shop_search_products` | Search/filter/sort the catalog (`query`, `category`, `sort`, `limit`) |
| `shop_add_to_cart` | Add a product by `productId` (+ optional `quantity`) |
| `shop_view_cart` | Return cart lines plus subtotal/shipping/tax/total |
| `shop_update_cart_item` | Set an item's quantity (0 removes it) |
| `shop_remove_from_cart` | Remove an item |
| `shop_sign_in` | Sign in with a demo account (required before checkout) |
| `shop_get_auth_status` | Report whether a user is signed in |
| `shop_checkout` | Place the order (requires sign-in + non-empty cart) |

Each tool returns an MCP-style result: `{ content: [{ type: 'text', text }], structuredContent }`.

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
  pages/          Catalog, Login, CartPage, Checkout, OrderConfirmation
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
