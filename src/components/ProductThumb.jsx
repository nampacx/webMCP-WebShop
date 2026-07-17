// The coloured category tile: a box tinted with the product's colour showing
// the category's first letter in its accent colour. Shared by the product card,
// the product detail page and the cart. Callers supply the class names (the
// three surfaces style it differently) and any extra badges via children.
export default function ProductThumb({
  product,
  as: Tag = 'div',
  className,
  glyphClassName,
  children,
  ...rest
}) {
  return (
    <Tag className={className} style={{ background: product.color }} {...rest}>
      <span className={glyphClassName} style={{ color: product.accent }} aria-hidden="true">
        {product.category[0]}
      </span>
      {children}
    </Tag>
  )
}
