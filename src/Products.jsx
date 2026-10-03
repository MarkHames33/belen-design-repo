import { useCallback, useEffect, useMemo, useState } from 'react'
import { ProductAPI, errorMessage } from './api.js'
import ProductForm from './ProductForm.jsx'

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' })
const LOW_STOCK = 5

export default function Products({ user, onLogout }) {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [editing, setEditing] = useState(null) // null | 'new' | product object
  const [confirmDel, setConfirmDel] = useState(null)

  const load = useCallback(async (term = '') => {
    setLoading(true)
    setError('')
    try {
      const res = await ProductAPI.list(term)
      setItems(res.data)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // search with a small debounce
  useEffect(() => {
    const t = setTimeout(() => load(search.trim()), 300)
    return () => clearTimeout(t)
  }, [search, load])

  const flash = (msg) => {
    setNotice(msg)
    setTimeout(() => setNotice(''), 3000)
  }

  const save = async (payload) => {
    if (editing === 'new') {
      await ProductAPI.create(payload)
      flash('Product added.')
    } else {
      await ProductAPI.update(editing.id, payload)
      flash('Product updated.')
    }
    setEditing(null)
    load(search.trim())
  }

  const remove = async () => {
    try {
      await ProductAPI.remove(confirmDel.id)
      flash('Product deleted.')
      setConfirmDel(null)
      load(search.trim())
    } catch (err) {
      setError(errorMessage(err))
      setConfirmDel(null)
    }
  }

  const stats = useMemo(
    () => ({
      count: items.length,
      units: items.reduce((n, p) => n + p.quantity, 0),
      value: items.reduce((n, p) => n + p.price * p.quantity, 0),
      low: items.filter((p) => p.quantity <= LOW_STOCK).length,
    }),
    [items]
  )

  return (
    <div className="shell">
      <header className="topbar">
        <h1 className="brand">Stockroom</h1>
        <div className="who">
          <span className="muted">{user.username}</span>
          <button className="btn" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <main className="content">
        <section className="summary" aria-label="Inventory summary">
          <div><strong>{stats.count}</strong><span>products</span></div>
          <div><strong>{stats.units}</strong><span>units on hand</span></div>
          <div><strong>{peso.format(stats.value)}</strong><span>stock value</span></div>
          <div className={stats.low ? 'warn' : ''}><strong>{stats.low}</strong><span>low on stock (≤ {LOW_STOCK})</span></div>
        </section>

        <div className="toolbar">
          <input
            type="search"
            placeholder="Search product name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          <button className="btn primary" onClick={() => setEditing('new')}>Add product</button>
        </div>

        {notice && <div className="toast" role="status">{notice}</div>}
        {error && <div className="alert" role="alert">{error}</div>}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th className="num">Price</th>
                <th className="num">Stock</th>
                <th>Added</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 && (
                <tr><td colSpan="5" className="empty">Loading products...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan="5" className="empty">No products found. Add your first product.</td></tr>
              )}
              {items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="pname">{p.product_name}</div>
                    {p.description && <div className="pdesc">{p.description}</div>}
                  </td>
                  <td className="num">{peso.format(p.price)}</td>
                  <td className="num">
                    <span className={p.quantity <= LOW_STOCK ? 'stock low' : 'stock'}>{p.quantity}</span>
                  </td>
                  <td className="muted nowrap">{p.created_at?.slice(0, 10)}</td>
                  <td className="actions">
                    <button className="btn small" onClick={() => setEditing(p)}>Edit</button>
                    <button className="btn small danger" onClick={() => setConfirmDel(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {editing && (
        <ProductForm
          product={editing === 'new' ? null : editing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}

      {confirmDel && (
        <div className="overlay" role="dialog" aria-modal="true">
          <div className="modal small-modal">
            <h2>Delete product?</h2>
            <p>
              <strong>{confirmDel.product_name}</strong> will be permanently removed.
            </p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn danger solid" onClick={remove}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
