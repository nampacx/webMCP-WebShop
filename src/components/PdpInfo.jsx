// The product detail information section: overview, highlights, sizes,
// colourways, specifications and tags.
export default function PdpInfo({ product }) {
  return (
    <div className="pdp-info">
      <section className="pdp-section">
        <h2>Overview</h2>
        <p className="pdp-details">{product.details}</p>

        <h3>Highlights</h3>
        <ul className="pdp-features">
          {product.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>

        {product.sizes.length > 0 && (
          <>
            <h3>Available sizes</h3>
            <div className="pdp-chips">
              {product.sizes.map((s) => (
                <span className="pdp-chip" key={s}>
                  {s}
                </span>
              ))}
            </div>
          </>
        )}

        <h3>Colourways</h3>
        <div className="pdp-chips">
          {product.colorways.map((c) => (
            <span className="pdp-chip" key={c}>
              {c}
            </span>
          ))}
        </div>
      </section>

      <aside className="pdp-section">
        <h2>Specifications</h2>
        <table className="pdp-specs">
          <tbody>
            {Object.entries(product.specs).map(([key, value]) => (
              <tr key={key}>
                <th scope="row">{key}</th>
                <td>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h3>Tags</h3>
        <div className="pdp-chips">
          {product.tags.map((t) => (
            <span className="pdp-chip pdp-chip-tag" key={t}>
              {t}
            </span>
          ))}
        </div>
      </aside>
    </div>
  )
}
