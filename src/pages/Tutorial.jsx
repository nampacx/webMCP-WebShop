import { useState } from 'react'

const TOOLS = [
  {
    name: 'shop_search_products',
    emoji: '🔍',
    summary: 'Search the product catalog with text queries and filters.',
    example: `await webmcp.callTool('shop_search_products', {
  query: 'running shoes',
  minRating: 4,
  onSaleOnly: true,
  sort: 'price-asc',
  limit: 5
})`,
    details:
      'Supports free-text search across names, brands, categories, SKUs, descriptions, features, specs, colorways and tags. Combine with filters for category, brand, price range, rating, stock and sale status. Returns compact summaries -- use shop_get_product for full details.',
  },
  {
    name: 'shop_get_product',
    emoji: '📦',
    summary: 'Get full details for a single product by ID or SKU.',
    example: `await webmcp.callTool('shop_get_product', {
  productId: 'run-001'
})`,
    details:
      'Returns the complete product record including long description, features, technical specs, available sizes and colorways, tags, warranty and release year.',
  },
  {
    name: 'shop_list_facets',
    emoji: '🏷️',
    summary: 'Discover all available categories, brands, tags and price ranges.',
    example: `await webmcp.callTool('shop_list_facets', {})`,
    details:
      'Returns the full set of filter values that exist in the catalog so an agent can build accurate search queries without guessing.',
  },
  {
    name: 'shop_add_to_cart',
    emoji: '🛒',
    summary: 'Add a product to the shopping cart.',
    example: `await webmcp.callTool('shop_add_to_cart', {
  productId: 'run-001',
  quantity: 2
})`,
    details:
      'Accepts a product ID or SKU and an optional quantity (default 1, capped at available stock). Returns the updated cart summary.',
  },
  {
    name: 'shop_view_cart',
    emoji: '👀',
    summary: 'View the current cart contents and totals.',
    example: `await webmcp.callTool('shop_view_cart', {})`,
    details:
      'Returns per-line totals plus subtotal, shipping, tax and grand total.',
  },
  {
    name: 'shop_update_cart_item',
    emoji: '✏️',
    summary: 'Change the quantity of a cart item (0 to remove).',
    example: `await webmcp.callTool('shop_update_cart_item', {
  productId: 'run-001',
  quantity: 3
})`,
    details:
      'Sets the quantity for an existing cart item. A quantity of 0 removes it entirely. Returns the updated cart summary.',
  },
  {
    name: 'shop_remove_from_cart',
    emoji: '🗑️',
    summary: 'Remove a product from the cart entirely.',
    example: `await webmcp.callTool('shop_remove_from_cart', {
  productId: 'run-001'
})`,
    details: 'Removes the item regardless of quantity. Returns the updated cart summary.',
  },
  {
    name: 'shop_sign_in',
    emoji: '🔑',
    summary: 'Sign in with a demo account (required before checkout).',
    example: `await webmcp.callTool('shop_sign_in', {
  email: 'demo@contoso.com',
  password: 'contoso123'
})`,
    details:
      'Demo accounts: demo@contoso.com / contoso123, jordan@contoso.com / sports456. Sign-in is required before checkout and profile tools.',
  },
  {
    name: 'shop_get_auth_status',
    emoji: '👤',
    summary: 'Check whether a user is currently signed in.',
    example: `await webmcp.callTool('shop_get_auth_status', {})`,
    details: 'Returns the signed-in status and user info if authenticated.',
  },
  {
    name: 'shop_get_user_profile',
    emoji: '📋',
    summary: 'Get the signed-in user\'s full profile and order stats.',
    example: `await webmcp.callTool('shop_get_user_profile', {})`,
    details:
      'Returns name, email, phone, member since, loyalty tier/points, saved shipping address, preferences, and order stats. Requires sign-in.',
  },
  {
    name: 'shop_update_shipping_address',
    emoji: '📮',
    summary: 'Update the saved shipping address (partial updates supported).',
    example: `await webmcp.callTool('shop_update_shipping_address', {
  city: 'Portland',
  zip: '97201'
})`,
    details:
      'Provide only the fields to change -- omitted fields keep their current value. The saved address is used to prefill checkout. Requires sign-in.',
  },
  {
    name: 'shop_checkout',
    emoji: '💳',
    summary: 'Place an order for the current cart contents.',
    example: `await webmcp.callTool('shop_checkout', {})`,
    details:
      'Requires sign-in and a non-empty cart. Shipping address falls back to the saved address. This is a demo -- no real payment is taken. A confirmation email is sent to the signed-in user\'s address.',
  },
]

function ToolCard({ tool }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="tutorial-tool-card">
      <button
        className="tutorial-tool-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="tutorial-tool-emoji">{tool.emoji}</span>
        <span className="tutorial-tool-info">
          <code className="tutorial-tool-name">{tool.name}</code>
          <span className="tutorial-tool-summary">{tool.summary}</span>
        </span>
        <span className={`tutorial-chevron ${open ? 'tutorial-chevron-open' : ''}`}>
          ▸
        </span>
      </button>
      {open && (
        <div className="tutorial-tool-body">
          <p>{tool.details}</p>
          <pre className="tutorial-code"><code>{tool.example}</code></pre>
        </div>
      )}
    </div>
  )
}

export default function Tutorial() {
  return (
    <div className="tutorial">
      <section className="hero">
        <div className="hero-content">
          <h1>WebMCP Tutorial</h1>
          <p>
            Learn how browser-based AI agents can interact with this shop through the WebMCP API.
          </p>
        </div>
      </section>

      <section className="tutorial-section">
        <h2>What is WebMCP?</h2>
        <p>
          WebMCP (Web Model Context Protocol) is a proposed browser API that lets web pages
          expose their capabilities as <strong>tools</strong> that AI agents can discover
          and call. Instead of scraping the DOM, an agent interacts with structured,
          well-documented functions -- just like calling an API.
        </p>
        <p>
          This demo shop registers its tools on{' '}
          <code>navigator.modelContext</code> (and the convenience wrapper{' '}
          <code>window.webmcp</code>) so any in-browser agent can search products, manage
          a cart, sign in, and complete a checkout -- all programmatically.
        </p>
      </section>

      <section className="tutorial-section">
        <h2>Quick start</h2>
        <p>
          Open your browser DevTools console on this site and try these commands:
        </p>
        <div className="tutorial-steps">
          <div className="tutorial-step">
            <span className="tutorial-step-num">1</span>
            <div>
              <p><strong>List available tools</strong></p>
              <pre className="tutorial-code"><code>webmcp.listTools().map(t =&gt; t.name)</code></pre>
            </div>
          </div>
          <div className="tutorial-step">
            <span className="tutorial-step-num">2</span>
            <div>
              <p><strong>Search the catalog</strong></p>
              <pre className="tutorial-code"><code>{`await webmcp.callTool('shop_search_products', { query: 'helmet' })`}</code></pre>
            </div>
          </div>
          <div className="tutorial-step">
            <span className="tutorial-step-num">3</span>
            <div>
              <p><strong>Add a product to the cart</strong></p>
              <pre className="tutorial-code"><code>{`await webmcp.callTool('shop_add_to_cart', { productId: 'cy-003' })`}</code></pre>
            </div>
          </div>
          <div className="tutorial-step">
            <span className="tutorial-step-num">4</span>
            <div>
              <p><strong>Sign in and checkout</strong></p>
              <pre className="tutorial-code"><code>{`await webmcp.callTool('shop_sign_in', {
  email: 'demo@contoso.com',
  password: 'contoso123'
})
await webmcp.callTool('shop_checkout', {})`}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <section className="tutorial-section">
        <h2>How it works</h2>
        <div className="tutorial-architecture">
          <div className="tutorial-arch-box">
            <h3>🌐 Runtime</h3>
            <p>
              <code>src/webmcp/runtime.js</code> creates a <code>WebModelContext</code> instance
              that acts as the tool registry. It is installed on{' '}
              <code>navigator.modelContext</code> and <code>window.webmcp</code>.
            </p>
          </div>
          <div className="tutorial-arch-arrow">→</div>
          <div className="tutorial-arch-box">
            <h3>🛠️ Tools</h3>
            <p>
              <code>src/webmcp/tools.js</code> defines the shop's tools. Each tool has a name,
              description, JSON Schema input, and an <code>execute</code> function that returns
              MCP-style results.
            </p>
          </div>
          <div className="tutorial-arch-arrow">→</div>
          <div className="tutorial-arch-box">
            <h3>📊 Audit Log</h3>
            <p>
              Every tool call is automatically recorded with redacted arguments, timing, and
              status. Access it via <code>webmcp.getAuditLog()</code>.
            </p>
          </div>
        </div>
      </section>

      <section className="tutorial-section">
        <h2>Available tools</h2>
        <p>Click any tool to see details and example usage.</p>
        <div className="tutorial-tool-list">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.name} tool={tool} />
          ))}
        </div>
      </section>

      <section className="tutorial-section">
        <h2>Result format</h2>
        <p>
          Every tool call returns a consistent MCP-style result object:
        </p>
        <pre className="tutorial-code"><code>{`{
  content: [{ type: 'text', text: 'Human-readable summary' }],
  structuredContent: { /* machine-readable data */ },
  isError: false  // true when the call failed gracefully
}`}</code></pre>
        <p>
          Errors are returned as results (not thrown), so agent code can handle them without
          try/catch.
        </p>
      </section>

      <section className="tutorial-section">
        <h2>Audit & observability</h2>
        <p>
          The runtime records every tool invocation in a capped ring buffer stored in
          localStorage. You can inspect and manage it:
        </p>
        <pre className="tutorial-code"><code>{`// View all audit entries
webmcp.getAuditLog()

// Export as a JSON string
webmcp.exportAuditLog()

// Clear the log
webmcp.clearAuditLog()`}</code></pre>
        <p>
          In development mode (<code>npm run dev</code>), audit entries are also written
          to <code>audit-log.jsonl</code> in the repo root.
        </p>
      </section>

      <section className="tutorial-section">
        <h2>Building your own agent</h2>
        <p>
          Any script running in the page can act as an agent. Here is a minimal example
          that searches for a product and adds it to the cart:
        </p>
        <pre className="tutorial-code"><code>{`// A tiny agent that finds the best-rated running shoe and adds it to the cart
const results = await webmcp.callTool('shop_search_products', {
  query: 'running shoes',
  sort: 'rating',
  limit: 1
})

const topProduct = results.structuredContent.products[0]
if (topProduct) {
  await webmcp.callTool('shop_add_to_cart', {
    productId: topProduct.id
  })
  console.log('Added', topProduct.name, 'to cart!')
}`}</code></pre>
      </section>
    </div>
  )
}
