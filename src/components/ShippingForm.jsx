import Field from './Field.jsx'

const COUNTRIES = ['United States', 'Canada', 'United Kingdom', 'Germany', 'Australia']

// Shipping-address fieldset for the checkout form. State is owned by the parent
// and threaded through `form` / `errors` / `update`.
export default function ShippingForm({ form, errors, update }) {
  return (
    <fieldset className="form-section">
      <legend>Shipping address</legend>
      <Field label="Full name" error={errors.name}>
        <input value={form.name} onChange={(e) => update('name', e.target.value)} />
      </Field>
      <Field label="Street address" error={errors.address}>
        <input value={form.address} onChange={(e) => update('address', e.target.value)} />
      </Field>
      <div className="form-cols">
        <Field label="City" error={errors.city}>
          <input value={form.city} onChange={(e) => update('city', e.target.value)} />
        </Field>
        <Field label="ZIP / Postal" error={errors.zip}>
          <input value={form.zip} onChange={(e) => update('zip', e.target.value)} />
        </Field>
      </div>
      <Field label="Country" error={errors.country}>
        <select value={form.country} onChange={(e) => update('country', e.target.value)}>
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </Field>
    </fieldset>
  )
}
