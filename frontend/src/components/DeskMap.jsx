import { IconArmchair, IconUser, IconClock, IconLock } from '@tabler/icons-react'

const ZONE_NAMES = {
  A: 'Zone A — Ground floor',
  B: 'Zone B — Reading room',
  C: 'Zone C — Silent zone',
  D: 'Zone D — Computer lab',
  E: 'Zone E — Study pods',
}

const STATUS_ICON = {
  FREE:      <IconArmchair size={22} />,
  OCCUPIED:  <IconUser     size={22} />,
  AWAY:      <IconClock    size={22} />,
  ABANDONED: <IconLock     size={22} />,
}

const STATUS_STYLE = {
  FREE:      { bg: 'bg-green-50',  border: 'border-green-300',  icon: 'text-green-600'  },
  OCCUPIED:  { bg: 'bg-red-50',    border: 'border-red-300',    icon: 'text-red-600'    },
  AWAY:      { bg: 'bg-yellow-50', border: 'border-yellow-300', icon: 'text-yellow-600' },
  ABANDONED: { bg: 'bg-slate-100', border: 'border-slate-300',  icon: 'text-slate-500'  },
}

function deskNum(code) {
  return parseInt(code.replace(/^[A-Z]+/, ''), 10)
}

export default function DeskMap({ desks = [], onDeskClick, selectedCode }) {
  if (!desks.length) {
    return (
      <div className="bg-card border border-line rounded-lg p-10 flex items-center justify-center text-ink3 text-sm">
        No desk data available.
      </div>
    )
  }

  const sections = {}
  for (const desk of desks) {
    if (!sections[desk.section]) sections[desk.section] = []
    sections[desk.section].push(desk)
  }

  const sortedSections = Object.keys(sections).sort()

  return (
    <div className="bg-card border border-line rounded-2xl p-8 space-y-8 shadow-sm">
      {sortedSections.map(sec => {
        // Sort numerically: A1, A2 ... A10, A11 ... A25
        const sorted = [...sections[sec]].sort((a, b) => deskNum(a.desk_code) - deskNum(b.desk_code))

        return (
          <div key={sec}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">{ZONE_NAMES[sec] ?? `Zone ${sec}`}</h3>
              <span className="text-sm text-gray-500">{sorted.length} Seats</span>
            </div>

            {/* Layout: row 1 = seats 1-10, row 2 = seats 11-20, row 3 = seats 21-25 */}
            {/* Single grid-cols-10; last 5 items use col-span-2 to fill full width */}
            <div className="grid grid-cols-10 gap-2">
              {sorted.map((desk, idx) => {
                const st = desk.status
                const isLastRow = idx >= 20
                return (
                  <button
                    key={desk.id}
                    onClick={() => onDeskClick?.(desk)}
                    className={[
                      isLastRow ? 'col-span-2' : 'col-span-1',
                      'h-[65px]',
                      'rounded-xl border',
                      'flex flex-col items-center justify-center gap-0.5',
                      'shadow-sm hover:shadow-md hover:scale-105 transition-all',
                      STATUS_STYLE[st].bg,
                      STATUS_STYLE[st].border,
                      st === 'AWAY' ? 'animate-away-pulse' : '',
                      selectedCode === desk.desk_code ? 'ring-2 ring-primary ring-offset-1' : '',
                    ].join(' ')}
                  >
                    <span className={STATUS_STYLE[st].icon}>{STATUS_ICON[st]}</span>
                    <span className="text-[11px] font-bold text-gray-700 leading-none">{desk.desk_code}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
