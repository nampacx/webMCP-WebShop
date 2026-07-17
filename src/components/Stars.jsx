// Star rating glyphs — renders ★/☆ for a 0-5 rating. Shared by the product
// card and the product detail page, which wrap it in their own layout.
export default function Stars({ rating }) {
  const full = Math.round(rating)
  return (
    <>
      {'★'.repeat(full)}
      {'☆'.repeat(5 - full)}
    </>
  )
}
