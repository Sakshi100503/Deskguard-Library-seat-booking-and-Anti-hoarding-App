import { useState } from 'react'
import { useCheckIn, useGoAway, useReturn, useRelease, useLibrarianReset, useDesks } from '../hooks/useDesks'
import useAuthStore from '../store/authStore'

function Btn({ onClick, disabled, variant = 'default', children }) {
  const base = 'flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    default: 'bg-primary hover:bg-primary-dark text-white',
    ghost:   'bg-page hover:bg-border text-muted',
    danger:  'bg-red-50 hover:bg-red-100 text-status-occupied border border-red-200',
    warning: 'bg-amber-50 hover:bg-amber-100 text-status-away border border-amber-200',
    success: 'bg-green-50 hover:bg-green-100 text-status-free border border-green-200',
  }
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  )
}

export default function ActionPanel() {
  const { user } = useAuthStore()
  const { data: desks } = useDesks()
  const [deskCode, setDeskCode] = useState('')
  const [toast, setToast] = useState(null)
  const [resetCode, setResetCode] = useState('')

  const checkIn   = useCheckIn()
  const goAway    = useGoAway()
  const returnFn  = useReturn()
  const release   = useRelease()
  const libReset  = useLibrarianReset()

  function notify(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function run(mutation, payload, successMsg) {
    try {
      await mutation.mutateAsync(payload)
      notify(successMsg)
    } catch (err) {
      notify(err.response?.data?.detail || err.message, 'error')
    }
  }

  const freeCodes = desks?.filter((d) => d.status === 'FREE').map((d) => d.desk_code) ?? []

  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
      <h2 className="text-sm font-semibold text-heading uppercase tracking-wide">Your Actions</h2>

      {/* Check-in */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-muted">Check in to a desk</label>
        <div className="flex gap-2">
          <select
            value={deskCode}
            onChange={(e) => setDeskCode(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
          >
            <option value="">Select a free desk…</option>
            {freeCodes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Btn
            disabled={!deskCode || checkIn.isPending}
            onClick={() => run(checkIn, { desk_code: deskCode }, `Checked in to ${deskCode}`)}
          >
            {checkIn.isPending ? '…' : 'Check in'}
          </Btn>
        </div>
      </div>

      {/* Active-booking actions */}
      <div className="flex gap-2 flex-wrap">
        <Btn variant="warning" disabled={goAway.isPending} onClick={() => run(goAway, undefined, 'Marked as Away')}>
          Away
        </Btn>
        <Btn variant="success" disabled={returnFn.isPending} onClick={() => run(returnFn, undefined, 'Welcome back!')}>
          Return
        </Btn>
        <Btn variant="danger" disabled={release.isPending} onClick={() => run(release, undefined, 'Desk released')}>
          Release
        </Btn>
      </div>

      {/* Librarian reset */}
      {user?.role === 'librarian' && (
        <div className="pt-3 border-t border-border space-y-2">
          <label className="block text-xs font-medium text-muted">Librarian — force reset</label>
          <div className="flex gap-2">
            <input
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.toUpperCase())}
              placeholder="Desk code e.g. B3"
              className="flex-1 px-3 py-2 rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Btn
              variant="danger"
              disabled={!resetCode || libReset.isPending}
              onClick={() => run(libReset, resetCode, `${resetCode} reset to FREE`)}
            >
              Reset
            </Btn>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`text-sm px-4 py-2.5 rounded-lg font-medium ${
            toast.type === 'error'
              ? 'bg-red-50 text-status-occupied border border-red-200'
              : 'bg-green-50 text-status-free border border-green-200'
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  )
}
