// Small string helpers shared across the app.

// Two-letter uppercase initials from a name, e.g. "Jordan Lee" -> "JL".
export function initials(name) {
  return String(name || '')
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// One-line postal address, e.g. "12 Oak St, Denver 80202, United States".
// Skips blank parts so partial addresses still read cleanly.
export function formatAddress(a = {}) {
  return [a.address, [a.city, a.zip].filter(Boolean).join(' '), a.country]
    .filter(Boolean)
    .join(', ')
}
