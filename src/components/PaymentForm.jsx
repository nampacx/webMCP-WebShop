import Field from './Field.jsx'

// Payment fieldset for the checkout form (demo only — no real card is charged).
// State is owned by the parent and threaded through `form` / `errors` / `update`.
export default function PaymentForm({ form, errors, update }) {
  return (
    <fieldset className="form-section">
      <legend>Payment</legend>
      <p className="demo-note">
        Demo only — do not enter real card details. Any 12–19 digit number is accepted.
      </p>
      <Field label="Name on card" error={errors.cardName}>
        <input value={form.cardName} onChange={(e) => update('cardName', e.target.value)} />
      </Field>
      <Field label="Card number" error={errors.cardNumber}>
        <input
          inputMode="numeric"
          placeholder="4111 1111 1111 1111"
          value={form.cardNumber}
          onChange={(e) => update('cardNumber', e.target.value)}
        />
      </Field>
      <div className="form-cols">
        <Field label="Expiry (MM/YY)" error={errors.expiry}>
          <input placeholder="12/28" value={form.expiry} onChange={(e) => update('expiry', e.target.value)} />
        </Field>
        <Field label="CVC" error={errors.cvc}>
          <input inputMode="numeric" placeholder="123" value={form.cvc} onChange={(e) => update('cvc', e.target.value)} />
        </Field>
      </div>
    </fieldset>
  )
}
