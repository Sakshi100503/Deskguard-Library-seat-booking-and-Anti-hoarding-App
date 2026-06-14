import { useState, useEffect } from 'react'
import { useMyBooking } from '../hooks/useDesks'

// Parse server UTC string (no Z suffix) as UTC
function parseUTC(iso) {
  if (!iso) return null
  return new Date(iso.endsWith('Z') ? iso : iso + 'Z')
}

function useElapsed(sinceISO) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    const since = parseUTC(sinceISO)
    if (!since) return
    const tick = () => setElapsed(Math.floor((Date.now() - since.getTime()) / 1000))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [sinceISO])
  return elapsed
}

function useCountdown(sinceISO, limitSeconds) {
  const elapsed = useElapsed(sinceISO)
  return Math.max(0, limitSeconds - elapsed)
}

function fmt(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function AwayCountdown({ awaySince }) {
  const remaining = useCountdown(awaySince, 20 * 60)
  const pct = (remaining / (20 * 60)) * 100
  const urgent = remaining < 5 * 60

  return (
    <div className={`mt-3 p-3 rounded-xl border ${urgent ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-semibold ${urgent ? 'text-status-occupied' : 'text-status-away'}`}>
          Away — time remaining
        </span>
        <span className={`text-sm font-bold tabular-nums ${urgent ? 'text-status-occupied' : 'text-status-away'}`}>
          {fmt(remaining)}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-amber-200 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'bg-status-occupied' : 'bg-status-away'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {remaining === 0 && (
        <p className="text-xs text-status-occupied mt-1.5 font-medium">Your desk will be released soon.</p>
      )}
    </div>
  )
}

function SessionDuration({ checkedInAt }) {
  const elapsed = useElapsed(checkedInAt)
  return <span className="tabular-nums">{fmt(elapsed)}</span>
}

export default function SessionPanel({ onStillHereNeeded }) {
  const { data: booking } = useMyBooking()

  // Notify parent when still-here prompt is active
  useEffect(() => {
    if (booking?.prompt_sent_at) {
      onStillHereNeeded?.(true)
    } else {
      onStillHereNeeded?.(false)
    }
  }, [booking?.prompt_sent_at])

  if (!booking) {
    return (
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">My Session</h2>
        <div className="flex items-center gap-3 text-muted py-2">
          <span className="w-2.5 h-2.5 rounded-full bg-border shrink-0" />
          <span className="text-sm">Not checked in</span>
        </div>
        <p className="text-xs text-muted mt-1">Select a free desk and check in using the panel below.</p>
      </div>
    )
  }

  const STATUS_COLOR = {
    OCCUPIED:  'bg-status-free',
    AWAY:      'bg-status-away',
    ABANDONED: 'bg-status-abandoned',
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h2 className="text-sm font-semibold text-heading uppercase tracking-wide mb-3">My Session</h2>

      <div className="flex items-center gap-3">
        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_COLOR[booking.away_since ? 'AWAY' : 'OCCUPIED'] || 'bg-status-free'}`} />
        <div>
          <p className="text-sm font-bold text-heading">Desk {booking.desk_code}</p>
          <p className="text-xs text-muted">
            In for <SessionDuration checkedInAt={booking.checked_in_at} />
          </p>
        </div>
      </div>

      {booking.away_since && <AwayCountdown awaySince={booking.away_since} />}

      {booking.prompt_sent_at && !booking.away_since && (
        <div className="mt-3 p-3 rounded-xl border border-amber-300 bg-amber-50">
          <p className="text-xs font-semibold text-status-away">Still Here? prompt is active — see dialog above.</p>
        </div>
      )}
    </div>
  )
}
