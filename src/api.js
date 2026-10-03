import axios from 'axios'

// All requests go to the LavaLust API. The frontend never talks to the database.
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')

const KEY = 'stockroom.session'

export const session = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || null
    } catch {
      return null
    }
  },
  set(data) {
    localStorage.setItem(KEY, JSON.stringify(data))
  },
  clear() {
    localStorage.removeItem(KEY)
  },
}

const api = axios.create({ baseURL: `${BASE_URL}/api` })

// Attach the access token to every request
api.interceptors.request.use((config) => {
  const s = session.get()
  if (s?.tokens?.access_token) {
    config.headers.Authorization = `Bearer ${s.tokens.access_token}`
  }
  return config
})

// On 401, try ONE refresh with the refresh token, then retry the request
let refreshing = null
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const s = session.get()
    const isAuthCall = original?.url?.startsWith('/auth/')

    if (error.response?.status === 401 && s?.tokens?.refresh_token && !original._retry && !isAuthCall) {
      original._retry = true
      try {
        refreshing =
          refreshing ||
          axios.post(`${BASE_URL}/api/auth/refresh`, { refresh_token: s.tokens.refresh_token })
        const { data } = await refreshing
        refreshing = null
        session.set({ ...s, tokens: data.tokens })
        original.headers.Authorization = `Bearer ${data.tokens.access_token}`
        return api(original)
      } catch (e) {
        refreshing = null
        session.clear()
        window.dispatchEvent(new Event('stockroom:logout'))
      }
    }
    return Promise.reject(error)
  }
)

export const errorMessage = (err) => {
  const d = err?.response?.data
  if (d?.errors) return Object.values(d.errors).join(' ')
  return d?.error || err?.message || 'Something went wrong.'
}

export const AuthAPI = {
  login: (login, password) => api.post('/auth/login', { login, password }).then((r) => r.data),
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data),
  logout: (refresh_token) => api.post('/auth/logout', { refresh_token }).then((r) => r.data),
}

export const ProductAPI = {
  list: (search = '') => api.get('/products', { params: search ? { search } : {} }).then((r) => r.data),
  create: (p) => api.post('/products', p).then((r) => r.data),
  update: (id, p) => api.put(`/products/${id}`, p).then((r) => r.data),
  remove: (id) => api.delete(`/products/${id}`).then((r) => r.data),
}
