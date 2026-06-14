import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { IconArmchair, IconSchool, IconBook } from '@tabler/icons-react'
import useAuthStore from '../store/authStore'

const LIB_CODE = 'ADMIN2024'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [role, setRole]       = useState('student')
  const [libCode, setLibCode] = useState('')
  const [codeError, setCodeError] = useState('')
  const { register, loading, error, clearError } = useAuthStore()
  const navigate = useNavigate()

  function handle(field) {
    return e => setForm(f => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()
    setCodeError('')

    if (role === 'librarian' && libCode !== LIB_CODE) {
      setCodeError('Invalid librarian access code.')
      return
    }

    try {
      await register(form.name, form.email, form.password, role)
      navigate(role === 'librarian' ? '/login' : '/login')
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

          <h2 className="text-xl font-bold text-ink tracking-tight mb-1">Create your account</h2>
          <p className="text-sm text-ink2 mb-6">Join DeskGuard and find a seat in seconds.</p>

          {(error || codeError) && (
            <div className="bg-danger-light text-danger border border-[#FFC9C9] rounded px-3 py-2 text-xs mb-4">
              {codeError || error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-ink2 mb-1.5">Full name</label>
              <input
                value={form.name} onChange={handle('name')} required
                placeholder="e.g. Sakshi Mehta"
                className="w-full px-3 py-2 border border-line2 rounded text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/[.12] transition bg-card"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink2 mb-1.5">Email</label>
              <input
                type="email" value={form.email} onChange={handle('email')} required
                placeholder="you@college.edu"
                className="w-full px-3 py-2 border border-line2 rounded text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/[.12] transition bg-card"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink2 mb-1.5">Password</label>
              <input
                type="password" value={form.password} onChange={handle('password')} required minLength={6}
                placeholder="Min 6 characters"
                className="w-full px-3 py-2 border border-line2 rounded text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/[.12] transition bg-card"
              />
            </div>

            {/* Role selector */}
            <div>
              <p className="text-xs font-medium text-ink2 mb-2">I am a…</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'student',   label: 'Student',   Icon: IconSchool },
                  { key: 'librarian', label: 'Librarian', Icon: IconBook },
                ].map(({ key, label, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setRole(key)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded border text-xs font-semibold transition ${
                      role === key
                        ? 'border-primary bg-primary-light text-primary'
                        : 'border-line2 bg-card text-ink2 hover:border-primary-mid hover:bg-primary-light'
                    }`}
                  >
                    <Icon size={22} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Librarian code */}
            {role === 'librarian' && (
              <div>
                <label className="block text-xs font-medium text-ink2 mb-1.5">Librarian access code</label>
                <input
                  type="password"
                  value={libCode}
                  onChange={e => setLibCode(e.target.value)}
                  placeholder="Enter code from head librarian"
                  className="w-full px-3 py-2 border border-line2 rounded text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/[.12] transition bg-card"
                />
                <div className="mt-1.5 bg-primary-light border border-primary-mid rounded px-3 py-1.5 text-xs text-primary">
                  Demo code: <strong>ADMIN2024</strong>
                </div>
              </div>
            )}

            <div className="h-px bg-line my-1" />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-primary hover:bg-primary-dark text-white text-sm font-medium transition disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Create account'}
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
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
