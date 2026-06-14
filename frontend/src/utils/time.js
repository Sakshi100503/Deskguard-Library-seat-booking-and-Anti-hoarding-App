import { useState, useEffect } from 'react'

export function parseUTC(iso) {
  if (!iso) return null
  return new Date(iso.endsWith('Z') ? iso : iso + 'Z')
}

export function useElapsed(sinceISO) {
  const [secs, setSecs] = useState(0)
  useEffect(() => {
    const since = parseUTC(sinceISO)
    if (!since) { setSecs(0); return }
    const tick = () => setSecs(Math.max(0, Math.floor((Date.now() - since.getTime()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [sinceISO])
  return secs
}

export function fmtDuration(totalSecs) {
  const h = Math.floor(totalSecs / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
}

export function fmtCountdown(sinceISO, limitSecs) {
  // Returns { remaining, pct, urgent }
  const since = parseUTC(sinceISO)
  if (!since) return { remaining: limitSecs, pct: 100, urgent: false }
  const elapsed = Math.floor((Date.now() - since.getTime()) / 1000)
  const remaining = Math.max(0, limitSecs - elapsed)
  return { remaining, pct: (remaining / limitSecs) * 100, urgent: remaining < 60 }
}
