// Shared form validation — one place for the address and payment rules used by
// the checkout page, the profile page and the WebMCP tools. Each validator
// returns an errors map keyed by field (empty means valid).

const ZIP_RE = /^\d{4,10}$/
const CARD_RE = /^\d{12,19}$/
const EXPIRY_RE = /^\d{2}\/\d{2}$/
const CVC_RE = /^\d{3,4}$/

export const ADDRESS_FIELDS = ['name', 'address', 'city', 'zip', 'country']

const blank = (v) => !String(v ?? '').trim()

// Validate a shipping address. `fields` limits which are required (checkout
// only needs address/city/zip because name and country have fallbacks).
// `requireZipFormat` additionally enforces the ZIP pattern on a present zip.
export function validateAddress(addr, { fields = ADDRESS_FIELDS, requireZipFormat = true } = {}) {
  const errors = {}
  for (const field of fields) {
    if (blank(addr?.[field])) errors[field] = 'Required'
  }
  if (requireZipFormat && !errors.zip && !ZIP_RE.test(String(addr?.zip ?? '').trim())) {
    errors.zip = 'Enter a valid ZIP/postal code'
  }
  return errors
}

// Validate the demo payment fields.
export function validatePayment({ cardName, cardNumber, expiry, cvc } = {}) {
  const errors = {}
  if (blank(cardName)) errors.cardName = 'Required'
  if (!CARD_RE.test(String(cardNumber ?? '').replace(/\s/g, ''))) errors.cardNumber = 'Enter 12–19 digits'
  if (!EXPIRY_RE.test(String(expiry ?? '').trim())) errors.expiry = 'MM/YY'
  if (!CVC_RE.test(String(cvc ?? '').trim())) errors.cvc = '3–4 digits'
  return errors
}
