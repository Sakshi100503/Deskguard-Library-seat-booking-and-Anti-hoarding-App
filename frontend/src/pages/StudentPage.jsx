import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconArmchair, IconMap, IconQrcode, IconLogout,
  IconClockPause, IconCheck, IconX,
} from '@tabler/icons-react'
import { useDesks, useMyBooking, useCheckIn, useGoAway, useReturn, useRelease } from '../hooks/useDesks'
import useAuthStore from '../store/authStore'
import DeskMap from '../components/DeskMap'
import DeskInfoModal from '../components/DeskInfoModal'
import StillHereModal from '../components/StillHereModal'
import { useElapsed, fmtDuration } from '../utils/time'
import { parseUTC } from '../utils/time'

// ── Away countdown sub-component ─────────────────────────────────────────────
function AwayCountdown({ awaySince }) {
  const elapsed   = useElapsed(awaySince)
  const limit     = 20 * 60
  const remaining = Math.max(0, limit - elapsed)
  const pct       = (remaining / limit) * 100
  const urgent    = remaining < 5 * 60

  return (
    <div className={`mt-3 rounded border p-3 ${urgent ? 'bg-danger-light border-[#FFC9C9]' : 'bg-warn-light border-[#FFD43B]'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className={`text-xs font-semibold ${urgent ? 'text-danger' : 'text-warn'}`}>Away — time remaining</span>
        <span className={`text-sm font-bold tabular-nums ${urgent ? 'text-danger' : 'text-warn'}`}>
          {fmtDuration(remaining)}
        </span>
      </div>
      <div className={`h-1.5 rounded-full ${urgent ? 'bg-[#FFC9C9]' : 'bg-[#FFD43B]/40'} overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-1000 ${urgent ? 'bg-danger' : 'bg-warn'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {remaining === 0 && (
        <p className="text-xs text-danger mt-1.5 font-medium">Your desk will be released soon.</p>
      )}
    </div>
  )
}

// ── Session stat box ──────────────────────────────────────────────────────────
function StatBox({ label, value, className = '' }) {
  return (
    <div className="bg-panel rounded p-3">
      <p className="text-xs text-ink3 font-medium mb-1">{label}</p>
      <p className={`text-[17px] font-bold text-ink ${className}`}>{value}</p>
    </div>
  )
}

// ── Session timer (live) ──────────────────────────────────────────────────────
function SessionTimer({ checkedInAt }) {
  const elapsed = useElapsed(checkedInAt)
  const cls =
    elapsed > 6600 ? 'text-danger' :  // > 110 min
    elapsed > 6000 ? 'text-warn'   :  // > 100 min
    'text-ink'
  return <span className={`text-[17px] font-bold tabular-nums ${cls}`}>{fmtDuration(elapsed)}</span>
}

// ── Map stat chip ─────────────────────────────────────────────────────────────
function StatChip({ label, count, color }) {
  return (
    <div className="bg-panel rounded p-3 text-center">
      <div className={`text-[22px] font-bold leading-none mb-0.5 ${color}`}>{count}</div>
      <div className="text-xs text-ink3 font-medium">{label}</div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function StudentPage() {
  const [tab,          setTab]          = useState('map')
  const [selectedDesk, setSelectedDesk] = useState(null)
  const [showStillHere,setShowStillHere]= useState(false)
  const [qrInput,      setQrInput]      = useState('')
  const [qrFeedback,   setQrFeedback]   = useState(null)

  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const { data: desks, isFetching } = useDesks()
  const { data: booking }           = useMyBooking()
  const checkIn  = useCheckIn()
  const goAway   = useGoAway()
  const returnFn = useReturn()
  const release  = useRelease()

  // Trigger Still Here modal when prompt is set
  useEffect(() => {
    if (booking?.prompt_sent_at) setShowStillHere(true)
  }, [booking?.prompt_sent_at])

  const counts = {
    free:      desks?.filter(d => d.status === 'FREE').length      ?? 0,
    occupied:  desks?.filter(d => d.status === 'OCCUPIED').length  ?? 0,
    away:      desks?.filter(d => d.status === 'AWAY').length      ?? 0,
    abandoned: desks?.filter(d => d.status === 'ABANDONED').length ?? 0,
  }

  async function handleCheckInFromModal(deskCode) {
    await checkIn.mutateAsync({ desk_code: deskCode })
    setSelectedDesk(null)
  }

  async function handleQRCheckin() {
    const code = qrInput.trim().toUpperCase()
    if (!code) { setQrFeedback({ msg: 'Enter a desk number first.', type: 'red' }); return }
    const desk = desks?.find(d => d.desk_code === code)
    if (!desk) {
      setQrFeedback({ msg: `Desk ${code} not found. Try format A1–D5.`, type: 'red' }); return
    }
    if (desk.status !== 'FREE') {
      setQrFeedback({ msg: `Desk ${code} is currently ${desk.status}. Pick a free desk.`, type: 'amber' }); return
    }
    try {
      await checkIn.mutateAsync({ desk_code: code })
      setQrInput('')
      setQrFeedback({ msg: `✓ Checked in to desk ${code}!`, type: 'green' })
      setTimeout(() => setQrFeedback(null), 3000)
    } catch (err) {
      setQrFeedback({ msg: err.response?.data?.detail || 'Check-in failed', type: 'red' })
    }
  }

  const TABS = [
    { key: 'map',     label: 'Library Map', Icon: IconMap },
    { key: 'mydesk',  label: 'My Desk',     Icon: IconQrcode },
  ]

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* ── Top navbar ── */}
      <nav className="h-[52px] bg-card border-b border-line flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2 font-semibold text-[15px] text-ink tracking-tight">
          <div className="w-[28px] h-[28px] bg-primary rounded-[7px] flex items-center justify-center text-white">
            <IconArmchair size={15} />
          </div>
          DeskGuard
        </div>
        <div className="flex items-center gap-2">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isFetching ? 'bg-primary animate-live-pulse' : 'bg-success'}`} />
            <span className="text-xs text-ink3 hidden sm:inline">{isFetching ? 'Updating…' : 'Live'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[28px] h-[28px] rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() ?? 'S'}
            </div>
            <span className="text-sm text-ink2 font-medium hidden sm:inline">{user?.name}</span>
          </div>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-ink2 hover:bg-panel text-xs font-medium transition"
          >
            <IconLogout size={14} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </nav>

      {/* ── Tab bar ── */}
      <div className="bg-card border-b border-line flex px-6 gap-1">
        {TABS.map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-3.5 py-3 text-sm font-medium border-b-2 transition ${
              tab === key
                ? 'text-primary border-primary'
                : 'text-ink3 border-transparent hover:text-ink'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">

        {/* MAP TAB */}
        {tab === 'map' && (
          <div>
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-[15px] font-semibold text-ink">Library floor plan</h2>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Free',      cls: 'mp-free'      },
                  { label: 'Occupied',  cls: 'mp-occupied'  },
                  { label: 'Away',      cls: 'mp-away'      },
                  { label: 'Abandoned', cls: 'mp-abandoned' },
                ].map(({ label, cls }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-ink3">
                    <div className={`w-[11px] h-[11px] rounded-[3px] ${cls}`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <DeskMap
              desks={desks ?? []}
              onDeskClick={setSelectedDesk}
              selectedCode={booking?.desk_code}
            />

            <div className="grid grid-cols-4 gap-2 mt-4">
              <StatChip label="Free"     count={counts.free}      color="text-success" />
              <StatChip label="Occupied" count={counts.occupied}  color="text-danger" />
              <StatChip label="Away"     count={counts.away}      color="text-warn" />
              <StatChip label="Released" count={counts.abandoned} color="text-ink3" />
            </div>
          </div>
        )}

        {/* MY DESK TAB */}
        {tab === 'mydesk' && (
          <div className="space-y-4 max-w-lg">
            {/* Session card */}
            <div className="bg-card border border-line rounded-lg p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-[15px] font-semibold text-ink">My session</h2>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  !booking           ? 'bg-panel text-ink3' :
                  booking.away_since ? 'bg-warn-light text-warn' :
                                       'bg-success-light text-success'
                }`}>
                  {!booking ? 'No active desk' : booking.away_since ? 'Away — paused' : 'Active session'}
                </span>
              </div>

              {booking ? (
                <>
                  <div className="grid grid-cols-3 gap-2.5 mb-4">
                    <StatBox label="Desk"        value={booking.desk_code} />
                    <StatBox label="Zone"        value={`Zone ${booking.desk_code?.[0]}`} />
                    <div className="bg-panel rounded p-3">
                      <p className="text-xs text-ink3 font-medium mb-1">Time active</p>
                      <SessionTimer checkedInAt={booking.checked_in_at} />
                    </div>
                  </div>

                  {booking.away_since && <AwayCountdown awaySince={booking.away_since} />}

                  <div className="flex gap-2 flex-wrap mt-4">
                    {!booking.away_since ? (
                      <button
                        onClick={() => goAway.mutate()}
                        disabled={goAway.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 rounded border border-line2 bg-card hover:bg-panel text-sm text-ink font-medium transition disabled:opacity-60"
                      >
                        <IconClockPause size={14} />
                        Step away (20 min)
                      </button>
                    ) : (
                      <button
                        onClick={() => returnFn.mutate()}
                        disabled={returnFn.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 rounded bg-primary hover:bg-primary-dark text-white text-sm font-medium transition disabled:opacity-60"
                      >
                        <IconCheck size={14} />
                        I'm back
                      </button>
                    )}
                    <button
                      onClick={() => release.mutate()}
                      disabled={release.isPending}
                      className="flex items-center gap-1.5 px-4 py-2 rounded bg-danger hover:bg-[#A61E4D] text-white text-sm font-medium transition disabled:opacity-60"
                    >
                      <IconX size={14} />
                      Release desk
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-ink2 leading-[1.6]">
                  You don't have an active desk. Scan a QR code or click any free desk on the map to check in.
                </p>
              )}
            </div>

            {/* QR check-in panel */}
            <div className="bg-card border border-line rounded-lg p-6">
              <h2 className="text-[15px] font-semibold text-ink mb-1">QR desk check-in</h2>
              <p className="text-xs text-ink2 mb-4 leading-[1.5]">
                Enter a desk number to simulate scanning the QR code on that desk.
              </p>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-ink2 mb-1.5">Desk number</label>
                  <input
                    value={qrInput}
                    onChange={e => setQrInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleQRCheckin()}
                    placeholder="e.g. A1 or B3"
                    className="w-full px-3 py-2 border border-line2 rounded text-sm text-ink outline-none focus:border-primary focus:ring-2 focus:ring-primary/[.12] transition bg-card"
                  />
                </div>
                <button
                  onClick={handleQRCheckin}
                  disabled={checkIn.isPending}
                  className="flex items-center gap-1.5 px-4 py-2 rounded bg-primary hover:bg-primary-dark text-white text-sm font-medium transition disabled:opacity-60 mb-[1px]"
                >
                  <IconQrcode size={14} />
                  Check in
                </button>
              </div>
              {qrFeedback && (
                <p className={`mt-2 text-sm font-medium ${
                  qrFeedback.type === 'green' ? 'text-success' :
                  qrFeedback.type === 'amber' ? 'text-warn' :
                  'text-danger'
                }`}>
                  {qrFeedback.msg}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showStillHere && booking?.prompt_sent_at && (
        <StillHereModal booking={booking} onDismiss={() => setShowStillHere(false)} />
      )}

      {selectedDesk && (
        <DeskInfoModal
          desk={selectedDesk}
          myBooking={booking}
          isLibrarian={false}
          onClose={() => setSelectedDesk(null)}
          onCheckIn={handleCheckInFromModal}
        />
      )}
    </div>
  )
}
