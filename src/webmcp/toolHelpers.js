// Shared helpers for the WebMCP tools: the MCP result builders and the two
// guards (auth, product lookup) that several tools repeat.

import { authStore } from '../lib/authStore.js'
import { getProductById } from '../lib/search.js'

// A successful MCP result. `text` is the human/agent-readable summary; when
// omitted the structured content is serialised.
export function ok(structuredContent, text) {
  return {
    content: [{ type: 'text', text: text ?? JSON.stringify(structuredContent) }],
    structuredContent,
  }
}

// An error MCP result (handled failure, not a thrown exception).
export function fail(text) {
  return { content: [{ type: 'text', text }], isError: true }
}

// Resolve the signed-in user, or an error result to return. Usage:
//   const { user, error } = requireUser(); if (error) return error
export function requireUser() {
  const user = authStore.getUser()
  if (!user) return { error: fail('Not signed in. Call shop_sign_in first.') }
  return { user }
}

// Resolve a product by id or SKU, or an error result to return.
export function resolveProduct(productId) {
  const product = getProductById(productId)
  if (!product) return { error: fail(`No product found with id or SKU "${productId}".`) }
  return { product }
}
