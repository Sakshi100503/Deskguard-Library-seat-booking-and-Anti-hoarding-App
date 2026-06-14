import { useState, useEffect } from 'react'
import { IconAlertTriangle, IconCheck, IconX } from '@tabler/icons-react'
import { useReturn, useRelease } from '../hooks/useDesks'
import { parseUTC } from '../utils/time'

const PROMPT_WINDOW = 5 * 60

function fmt(s) {
  const m = Math.floor(Math.max(0, s) / 60)
  const sec = Math.max(0, s) % 60
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

export default function StillHereModal({ booking, onDismiss }) {
  const [remaining, setRemaining] = useState(PROMPT_WINDOW)
  const returnFn = useReturn()
  const release  = useRelease()

  useEffect(() => {
    const sent = parseUTC(booking?.prompt_sent_at)
    if (!sent) return
    const tick = () => {
      setRemaining(Math.max(0, PROMPT_WINDOW - Math.floor((Date.now() - sent.getTime()) / 1000)))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [booking?.prompt_sent_at])

  const pct    = (remaining / PROMPT_WINDOW) * 100
  const urgent = remaining < 60

  async function handleConfirm() {
    await returnFn.mutateAsync()
    onDismiss()
  }

  async function handleRelease() {
    await release.mutateAsync()
    onDismiss()
  }

  return (
    <div className="fixed inset-0 bg-ink/[.35] backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-line rounded-lg shadow-2xl p-6 w-full max-w-[340px] text-center">
        {/* Icon */}
        <div className="w-[52px] h-[52px] rounded-full bg-warn-light text-warn flex items-center justify-center mx-auto mb-4">
          <IconAlertTriangle size={26} />
        </div>

        <h3 className="text-[17px] font-bold text-ink tracking-tight mb-1.5">Still at your desk?</h3>
        <p className="text-sm text-ink2 mb-5 leading-[1.6]">
          Your 2-hour session is up. Confirm you're still here or your seat will be released in{' '}
          <strong className={urgent ? 'text-danger' : 'text-warn'}>{fmt(remaining)}</strong>.
        </p>

        {/* Countdown bar */}
        <div className="mb-5">
          <div className="h-2 rounded-full bg-warn-light/60 overflow-hidden border border-[#FFD43B]/40">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'bg-danger' : 'bg-warn'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            disabled={returnFn.isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded bg-primary hover:bg-primary-dark text-white text-sm font-medium transition disabled:opacity-60"
          >
            <IconCheck size={14} />
            {returnFn.isPending ? 'Confirming…' : "Yes, I'm here"}
          </button>
          <button
            onClick={handleRelease}
            disabled={release.isPending}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded border border-line2 bg-card hover:bg-panel text-sm text-ink font-medium transition disabled:opacity-60"
          >
            <IconX size={14} />
            {release.isPending ? 'Releasing…' : 'Release desk'}
          </button>
        </div>
      </div>
    </div>
  )
}
