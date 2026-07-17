import { useState } from 'react'
import { validateAddress } from '../lib/validation.js'
import { useTemporaryFlag } from '../hooks/useTemporaryFlag.js'
import Field from './Field.jsx'
import AddressBlock from './AddressBlock.jsx'

const ADDRESS_FIELDS = [
  { key: 'name', label: 'Recipient' },
  { key: 'address', label: 'Street address' },
  { key: 'city', label: 'City' },
  { key: 'zip', label: 'ZIP / Postal' },
  { key: 'country', label: 'Country' },
]

// The profile's editable shipping-address card. Reads the current address and
// saves via `onSave(patch)` (which returns { ok, error }).
export default function AddressCard({ address, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(address)
  const [errors, setErrors] = useState({})
  const [saved, flashSaved] = useTemporaryFlag()

  function startEdit() {
    setDraft(address)
    setErrors({})
    setEditing(true)
  }

  function handleSave(e) {
    e.preventDefault()
    const next = validateAddress(draft)
    setErrors(next)
    if (Object.keys(next).length) return

    const result = onSave(
      Object.fromEntries(ADDRESS_FIELDS.map(({ key }) => [key, String(draft[key]).trim()]))
    )
    if (!result.ok) {
      setErrors({ form: result.error })
      return
    }
    setEditing(false)
    flashSaved()
  }

  return (
    <section className="profile-card">
      <div className="profile-card-head">
        <h2>Shipping address</h2>
        {!editing && (
          <button className="btn btn-ghost btn-sm" onClick={startEdit}>
            Edit
          </button>
        )}
      </div>

      {saved && <p className="save-flash">✓ Shipping address updated</p>}

      {editing ? (
        <form onSubmit={handleSave} className="address-form" noValidate>
          {ADDRESS_FIELDS.map(({ key, label }) => (
            <Field label={label} error={errors[key]} key={key}>
              <input
                value={draft[key] ?? ''}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.value }))}
              />
            </Field>
          ))}
          {errors.form && <p className="form-error">{errors.form}</p>}
          <div className="address-actions">
            <button type="submit" className="btn btn-primary">
              Save address
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <AddressBlock address={address} className="profile-address" />
      )}
      <p className="profile-hint">Used to prefill checkout.</p>
    </section>
  )
}
