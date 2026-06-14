const STATUSES = [
  { key: 'FREE',      label: 'Free',      color: 'bg-status-free' },
  { key: 'OCCUPIED',  label: 'Occupied',  color: 'bg-status-occupied' },
  { key: 'AWAY',      label: 'Away',      color: 'bg-status-away' },
  { key: 'ABANDONED', label: 'Abandoned', color: 'bg-status-abandoned' },
]

export default function StatusLegend({ desks = [] }) {
  const counts = desks.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {STATUSES.map(({ key, label, color }) => (
        <div key={key} className="bg-white rounded-xl border border-border px-4 py-3 flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full shrink-0 ${color}`} />
          <div>
            <p className="text-xs text-muted font-medium uppercase tracking-wide">{label}</p>
            <p className="text-xl font-bold text-heading leading-tight">{counts[key] ?? 0}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
