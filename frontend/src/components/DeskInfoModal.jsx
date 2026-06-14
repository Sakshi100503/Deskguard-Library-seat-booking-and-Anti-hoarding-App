import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  IconArmchair,
  IconUser,
  IconClock,
  IconLock,
  IconX
} from '@tabler/icons-react'

const STATUS_DESC = {
  FREE:
    'This desk is available and ready for check-in.',

  OCCUPIED:
    'This desk is currently occupied by another student.',

  AWAY:
    'The student is temporarily away from the desk.',

  ABANDONED:
    'This desk was automatically released due to inactivity.'
}

const STATUS_BADGE = {
  FREE: 'pill-free',
  OCCUPIED: 'pill-occupied',
  AWAY: 'pill-away',
  ABANDONED: 'pill-abandoned',
}

const STATUS_ICON = {
  FREE: <IconArmchair size={34} />,
  OCCUPIED: <IconUser size={34} />,
  AWAY: <IconClock size={34} />,
  ABANDONED: <IconLock size={34} />
}

const STATUS_ICON_BG = {
  FREE: 'bg-green-100 text-green-600',
  OCCUPIED: 'bg-red-100 text-red-600',
  AWAY: 'bg-yellow-100 text-yellow-600',
  ABANDONED: 'bg-slate-200 text-slate-600'
}

export default function DeskInfoModal({ desk, myBooking, isLibrarian, onClose, onCheckIn, onReset }) {
  const [showQR, setShowQR] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const canCheckIn = !isLibrarian && desk.status === 'FREE' && !myBooking
  const canReset = isLibrarian && desk.status !== 'FREE'

  async function handleCheckIn() {
    setBusy(true)
    try { await onCheckIn(desk.desk_code) } finally { setBusy(false) }
  }

  async function handleReset() {
    setBusy(true)
    try { await onReset(desk.desk_code); onClose() } finally { setBusy(false) }
  }

  const checkinUrl = `${window.location.origin}/checkin/${desk.desk_code}`

  return (
    <div
      className="fixed inset-0 bg-ink/[.35] backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="
    relative
    bg-white
    border
    border-slate-200
    rounded-2xl
    shadow-2xl
    p-8
    w-full
    max-w-md
    text-center
  "
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="
    absolute
    top-4
    right-4
    text-gray-400
    hover:text-gray-700
    transition
  "
        >
          <IconX size={20} />
        </button>


        <div
          className={`
    w-[70px]
    h-[70px]
    rounded-full
    flex
    items-center
    justify-center
    mx-auto
    mb-5
    ${STATUS_ICON_BG[desk.status]}
  `}
        >
          {STATUS_ICON[desk.status]}
        </div>




        <div className="flex items-center justify-center gap-2 mb-2">
          <h3 className="text-2xl font-bold text-gray-900">
            Desk {desk.desk_code}
          </h3>

          <span
            className={`
      text-sm
      font-semibold
      px-3
      py-1
      rounded-full
      ${STATUS_BADGE[desk.status]}
    `}
          >
            {desk.status}
          </span>
        </div>

        <p className="text-gray-600 mb-5">
          {STATUS_DESC[desk.status]}
        </p>

        {/* QR code toggle */}
        {desk.status === 'FREE' && (
          <>
            {showQR ? (
              <div className="mb-4 flex flex-col items-center gap-2">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <QRCodeSVG
                    value={checkinUrl}
                    size={180}
                    level="M"
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Scan to check in
                </p>

                <button
                  onClick={() => setShowQR(false)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Hide QR
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowQR(true)}
                className="
          mb-4
          px-4
          py-2
          rounded-lg
          bg-blue-600
          text-white
          hover:bg-blue-700
          transition
        "
              >
                Show QR Code
              </button>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2">
          {canCheckIn && (
            <button
              onClick={handleCheckIn}
              disabled={busy}
              className="w-full py-2 rounded bg-primary hover:bg-primary-dark text-white text-sm font-medium transition disabled:opacity-60"
            >
              {busy ? 'Checking in…' : 'Check in here'}
            </button>
          )}
          {canReset && (
            <button
              onClick={handleReset}
              disabled={busy}
              className="w-full py-2 rounded bg-danger hover:bg-[#A61E4D] text-white text-sm font-medium transition disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              Reset desk
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-2 rounded border border-line2 bg-card hover:bg-panel text-sm text-ink font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
