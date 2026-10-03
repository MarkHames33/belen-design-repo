import { useEffect, useState } from 'react'
import { AuthAPI, session } from './api.js'
import Login from './Login.jsx'
import Products from './Products.jsx'

export default function App() {
  const [user, setUser] = useState(() => session.get()?.user || null)

  // Axios interceptor fires this when the refresh token no longer works
  useEffect(() => {
    const onLogout = () => setUser(null)
    window.addEventListener('stockroom:logout', onLogout)
    return () => window.removeEventListener('stockroom:logout', onLogout)
  }, [])

  const handleAuth = (data) => {
    session.set({ user: data.user, tokens: data.tokens })
    setUser(data.user)
  }

  const handleLogout = async () => {
    const s = session.get()
    try {
      if (s?.tokens?.refresh_token) await AuthAPI.logout(s.tokens.refresh_token)
    } catch {
      /* token may already be invalid - log out locally anyway */
    }
    session.clear()
    setUser(null)
  }

  return user ? <Products user={user} onLogout={handleLogout} /> : <Login onAuth={handleAuth} />
}
