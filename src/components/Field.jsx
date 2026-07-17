// A labelled form control with an inline validation message. Shared by the
// checkout, profile and login forms.
export default function Field({ label, error, children }) {
  return (
    <label className={`field ${error ? 'field-error' : ''}`}>
      <span>
        {label}
        {error && <em className="field-msg">{error}</em>}
      </span>
      {children}
    </label>
  )
}
