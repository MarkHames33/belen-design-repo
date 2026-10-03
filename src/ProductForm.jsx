import { useState } from 'react'
import { errorMessage } from './api.js'

export default function ProductForm({ product, onSave, onCancel }) {
  const [form, setForm] = useState({
    product_name: product?.product_name ?? '',
    description: product?.description ?? '',
    price: product?.price ?? '',
    quantity: product?.quantity ?? '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onSave({
        product_name: form.product_name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        quantity: parseInt(form.quantity, 10),
      })
    } catch (err) {
      setError(errorMessage(err))
      setBusy(false)
    }
  }

  return (
    <div className="overlay" role="dialog" aria-modal="true">
      <form className="modal stack" onSubmit={submit}>
        <h2>{product ? 'Edit product' : 'Add product'}</h2>

        <label>
          Product name
          <input value={form.product_name} onChange={set('product_name')} maxLength={100} required autoFocus />
        </label>

        <label>
          Description
          <textarea rows="3" value={form.description} onChange={set('description')} />
        </label>

        <div className="row">
          <label>
            Price (PHP)
            <input type="number" step="0.01" min="0" value={form.price} onChange={set('price')} required />
          </label>
          <label>
            Quantity
            <input type="number" step="1" min="0" value={form.quantity} onChange={set('quantity')} required />
          </label>
        </div>

        {error && <div className="alert" role="alert">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="btn" onClick={onCancel}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}
