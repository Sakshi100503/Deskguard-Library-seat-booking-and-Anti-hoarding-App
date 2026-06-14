import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconArmchair } from '@tabler/icons-react'
import useAuthStore from '../store/authStore'
import { PENDING_KEY } from './QRCheckinPage'

export default function LoginPage() {
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()
    try {
      const data = await login(email, password)
      const pending = sessionStorage.getItem(PENDING_KEY)
      if (pending) {
        sessionStorage.removeItem(PENDING_KEY)
        navigate(`/checkin/${pending}`, { replace: true })
      } else if (data.role === 'librarian') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/app', { replace: true })
      }
    } catch {}
  }

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        <div className="bg-card border border-line rounded-lg shadow-sm p-8">
          {/* Logo */}
          <div className="flex items-center gap-2 font-semibold text-[15px] text-ink mb-6">
            <div className="w-[30px] h-[30px] bg-primary rounded-[7px] flex items-center justify-center text-white shrink-0">
              <IconArmchair size={16} />
            </div>
            DeskGuard
          </div>

          <h2 className="text-xl font-bold text-ink tracking-tight mb-1">Welcome back</h2>
          <p className="text-sm text-ink2 mb-6">Sign in to continue to DeskGuard.</p>

          {error && (
            <div className="bg-danger-light text-danger border border-[#FFC9C9] rounded px-3 py-2 text-xs mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-ink2 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@college.edu"
                className="w-full px-3 py-2 border border-line2 rounded text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/[.12] transition bg-card"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink2 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Your password"
                className="w-full px-3 py-2 border border-line2 rounded text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/[.12] transition bg-card"
              />
            </div>

            <div className="h-px bg-line my-1" />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-primary hover:bg-primary-dark text-white text-sm font-medium transition disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2 rounded border border-line2 bg-card hover:bg-panel text-sm text-ink font-medium transition"
            >
              ← Back to home
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-ink3 mt-3">
          No account yet?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
