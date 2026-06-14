import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('deskguard_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      // Clear token from storage only — do NOT hard-redirect with window.location.
      // That bypasses React Router and breaks the public landing page.
      // RequireAuth in App.jsx handles the redirect to /login for protected routes.
      localStorage.removeItem('deskguard_token')
    }
    return Promise.reject(err)
  }
)

export default api
