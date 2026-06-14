import { create } from 'zustand'
import api from '../api/client'

const TOKEN_KEY = 'deskguard_token'

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY) || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const form = new URLSearchParams({ username: email, password })
      const { data } = await api.post('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      localStorage.setItem(TOKEN_KEY, data.access_token)
      set({ token: data.access_token, user: { name: data.name, role: data.role }, loading: false })
      return data
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed'
      set({ loading: false, error: msg })
      throw new Error(msg)
    }
  },

  register: async (name, email, password, role = 'student') => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role })
      set({ loading: false })
      return data
    } catch (err) {
      const msg = err.response?.data?.detail || 'Registration failed'
      set({ loading: false, error: msg })
      throw new Error(msg)
    }
  },

  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me')
      set({ user: { name: data.name, role: data.role, email: data.email, id: data.id } })
    } catch {
      set({ user: null, token: null })
      localStorage.removeItem(TOKEN_KEY)
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY)
    set({ user: null, token: null, error: null })
  },

  clearError: () => set({ error: null }),
}))

export default useAuthStore
