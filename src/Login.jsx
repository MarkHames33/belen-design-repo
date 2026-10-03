import { useState } from 'react'
import { AuthAPI, errorMessage } from './api.js'

export default function Login({ onAuth }) {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ login: '', username: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const data =
        mode === 'login'
          ? await AuthAPI.login(form.login, form.password)
          : await AuthAPI.register({ username: form.username, email: form.email, password: form.password })
      onAuth(data)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1 className="brand">Stockroom</h1>
        <p className="muted">Sign in to manage your products.</p>

        <form onSubmit={submit} className="stack">
          {mode === 'login' ? (
            <label>
              Email or username
              <input value={form.login} onChange={set('login')} autoComplete="username" required autoFocus />
            </label>
          ) : (
            <>
              <label>
                Username
                <input value={form.username} onChange={set('username')} autoComplete="username" required />
              </label>
              <label>
                Email
                <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required />
              </label>
            </>
          )}
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={set('password')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={mode === 'register' ? 6 : undefined}
              required
            />
          </label>

          {error && <div className="alert" role="alert">{error}</div>}

          <button className="btn primary" disabled={busy}>
            {busy ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <p className="switch muted">
          {mode === 'login' ? 'No account yet?' : 'Already registered?'}{' '}
          <button
            type="button"
            className="link"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login')
              setError('')
            }}
          >
            {mode === 'login' ? 'Register' : 'Log in'}
          </button>
        </p>
      </section>
    </main>
  )
}
