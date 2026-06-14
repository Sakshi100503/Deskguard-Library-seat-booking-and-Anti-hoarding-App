import { QRCodeSVG } from 'qrcode.react'
import { useEffect } from 'react'

export default function QRModal({ desk, onClose }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const checkinUrl = `${window.location.origin}/checkin/${desk.desk_code}`

  const STATUS_BADGE = {
    FREE:      'bg-green-100 text-status-free',
    OCCUPIED:  'bg-red-100 text-status-occupied',
    AWAY:      'bg-amber-100 text-status-away',
    ABANDONED: 'bg-slate-100 text-status-abandoned',
  }

  return (
    <div
      className="fixed inset-0 bg-heading/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl border border-border p-6 w-full max-w-xs text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-heading">Desk {desk.desk_code}</h3>
            <p className="text-xs text-muted">Section {desk.section}</p>
          </div>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[desk.status] || STATUS_BADGE.FREE}`}>
            {desk.status}
          </span>
        </div>

        <div className="flex justify-center mb-4 p-3 bg-page rounded-xl">
          <QRCodeSVG value={checkinUrl} size={160} level="M" includeMargin />
        </div>

        <p className="text-xs text-muted mb-4">
          Scan to check in to this desk
        </p>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-lg bg-page text-muted hover:bg-border text-sm font-medium transition"
        >
          Close
        </button>
      </div>
    </div>
  )
}
