import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconShield,
  IconLayoutDashboard,
  IconMap,
  IconList,
  IconLogout,
  IconRefresh,
  IconAlertTriangle,
  IconCheck,
  IconUsers,
  IconClock,
  IconAlertCircle,
} from '@tabler/icons-react'
import { useAdminDesks, useLibrarianReset } from '../hooks/useDesks'
import useAuthStore from '../store/authStore'
import DeskMap from '../components/DeskMap'
import DeskInfoModal from '../components/DeskInfoModal'
import { parseUTC } from '../utils/time'

function elapsed(iso) {
  if (!iso) return '—'
  const diff = Math.floor((Date.now() - parseUTC(iso).getTime()) / 1000)
  const h = Math.floor(diff / 3600)
  const m = Math.floor((diff % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

const STATUS_PILL = {
  FREE: 'pill-free',
  OCCUPIED: 'pill-occupied',
  AWAY: 'pill-away',
  ABANDONED: 'pill-abandoned',
}

const STAT_COLOR = {
  FREE: 'text-success',
  OCCUPIED: 'text-danger',
  AWAY: 'text-warn',
  ABANDONED: 'text-ink3',
}

export default function LibrarianPage() {
  const [tab, setTab] = useState('overview')
  const [selectedDesk, setSelectedDesk] = useState(null)
  const [toast, setToast] = useState(null)

  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const { data: desks, isLoading, isFetching } = useAdminDesks()
  const reset = useLibrarianReset()

  function notify(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function handleReset(deskCode) {
    try {
      await reset.mutateAsync(deskCode)
      notify(`Desk ${deskCode} reset to FREE`)
    } catch (err) {
      notify(err.response?.data?.detail || 'Reset failed', 'error')
    }
  }

  const counts = ['FREE', 'OCCUPIED', 'AWAY', 'ABANDONED'].reduce((acc, s) => {
    acc[s] = desks?.filter(d => d.status === s).length ?? 0
    return acc
  }, {})

  const abandoned = desks?.filter(d => d.status === 'ABANDONED') ?? []

  // Adapt admin desks to simple DeskOut format for DeskMap
  const mapDesks = desks?.map(({ id, desk_code, section, pos_x, pos_y, status }) =>
    ({ id, desk_code, section, pos_x, pos_y, status })
  ) ?? []

  const TABS = [
    { key: 'overview', label: 'Overview', Icon: IconLayoutDashboard },
    { key: 'map', label: 'Floor map', Icon: IconMap },
    { key: 'log', label: 'Desk log', Icon: IconList },
  ]

  return (
    <div className="min-h-screen bg-page flex flex-col">
      {/* ── Top navbar ── */}
      <nav className="h-[72px] bg-card border-b border-line flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
            <IconShield size={22} className="text-white" />
          </div>

          <div className="flex flex-col">
            <span className="text-2xl font-bold text-ink">
              DeskGuard
            </span>

            <span className="text-xs font-medium text-ink3">
              Librarian Portal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className={`w-1.5 h-1.5 rounded-full ${isFetching ? 'bg-primary animate-live-pulse' : 'bg-success'}`} />
            <span className="text-xs text-ink3 hidden sm:inline">{isFetching ? 'Updating…' : 'Live'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-[28px] h-[28px] rounded-full bg-admin-light text-admin flex items-center justify-center text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() ?? 'L'}
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
            className={`flex items-center gap-1.5 px-3.5 py-3 text-sm font-medium border-b-2 transition ${tab === key
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
      <div className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Toast */}
        {toast && (
          <div className={`text-sm px-4 py-2.5 rounded border font-medium ${toast.type === 'error'
            ? 'bg-danger-light text-danger border-[#FFC9C9]'
            : 'bg-success-light text-success border-[#8CE99A]'
            }`}>
            {toast.msg}
          </div>
        )}

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <>
            {/* Alert banner */}
            {abandoned.length > 0 && (
              <div className="bg-warn-light border border-[#FFD43B] rounded px-4 py-2.5 text-sm text-[#7C4700] flex items-center gap-2 font-medium">
                <IconAlertTriangle size={16} />
                {abandoned.length} desk{abandoned.length > 1 ? 's are' : ' is'} abandoned and need{abandoned.length === 1 ? 's' : ''} a manual reset.
              </div>
            )}

            {/* Dashboard Header */}
            <div>
              <h1 className="text-3xl font-bold text-ink">
                Library Dashboard
              </h1>

              <p className="text-sm text-ink3 mt-1">
                Monitor desk occupancy and availability in real time.
              </p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              {[
                {
                  key: 'FREE',
                  label: 'Free Desks',
                  icon: IconCheck,
                  bg: 'bg-green-50',
                  border: 'border-green-200',
                  text: 'text-green-700',
                },
                {
                  key: 'OCCUPIED',
                  label: 'Occupied',
                  icon: IconUsers,
                  bg: 'bg-blue-50',
                  border: 'border-blue-200',
                  text: 'text-blue-700',
                },
                {
                  key: 'AWAY',
                  label: 'Away',
                  icon: IconClock,
                  bg: 'bg-amber-50',
                  border: 'border-amber-200',
                  text: 'text-amber-700',
                },
                {
                  key: 'ABANDONED',
                  label: 'Abandoned',
                  icon: IconAlertCircle,
                  bg: 'bg-red-50',
                  border: 'border-red-200',
                  text: 'text-red-700',
                },
              ].map(item => {
                const Icon = item.icon

                return (
                  <div
                    key={item.key}
                    className={`
    ${item.bg}
    ${item.border}
    border
    rounded-2xl
    p-6
    hover:shadow-xl
    hover:-translate-y-1
    transition-all
    duration-300
  `}
                  >
                    <div className="flex justify-between items-start">

                      <div>
                        <p className={`text-sm font-semibold uppercase ${item.text}`}>
                          {item.label}
                        </p>

                        <p className={`text-5xl font-bold mt-3 ${item.text}`}>
                          {counts[item.key]}
                        </p>

                        <p className="text-xs text-gray-500 mt-3">
                          Real-time status
                        </p>
                      </div>

                      <div className={`
      w-14 h-14 rounded-full flex items-center justify-center
      ${item.bg}
      border ${item.border}
    `}>
                        <Icon size={30} className={item.text} />
                      </div>

                    </div>
                  </div>
                )
              })}
            </div>


            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white shadow-md">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">
                    Current Library Occupancy
                  </h3>

                  <p className="text-blue-100 mt-1">
                    {counts.OCCUPIED} desks currently occupied out of{' '}
                    {counts.FREE +
                      counts.OCCUPIED +
                      counts.AWAY +
                      counts.ABANDONED}
                  </p>
                </div>

                <div className="text-3xl font-bold">
                  {Math.round(
                    (counts.OCCUPIED /
                      (counts.FREE +
                        counts.OCCUPIED +
                        counts.AWAY +
                        counts.ABANDONED || 1)) *
                    100
                  )}
                  %
                </div>
              </div>




              <div className="bg-card border border-line rounded-2xl p-5">
                <h3 className="font-semibold text-lg mb-4">
                  Quick Actions
                </h3>

                <div className="flex flex-wrap gap-3">

                  <button
                    onClick={() => setTab('map')}
                    className="px-4 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                  >
                    Open Floor Map
                  </button>

                  <button
                    onClick={() => setTab('log')}
                    className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100"
                  >
                    View Desk Log
                  </button>

                </div>
              </div>

              <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full"
                  style={{
                    width: `${(counts.OCCUPIED /
                      (counts.FREE +
                        counts.OCCUPIED +
                        counts.AWAY +
                        counts.ABANDONED || 1)) *
                      100
                      }%`,
                  }}
                />
              </div>
            </div>


            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-card border border-line rounded-2xl p-5">
                <h3 className="text-lg font-semibold mb-5">
                  Desk Status Distribution
                </h3>

                <div className="space-y-4">

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Free</span>
                    </div>

                    <span className="font-bold">{counts.FREE}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Occupied</span>
                    </div>

                    <span className="font-bold">{counts.OCCUPIED}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="flex-1 ml-2">Away</span>
                    <span className="font-bold">{counts.AWAY}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="flex-1 ml-2">Abandoned</span>
                    <span className="font-bold">{counts.ABANDONED}</span>
                  </div>

                </div>
              </div>

              <div className="bg-card border border-line rounded-2xl p-5">
                <h3 className="text-lg font-semibold mb-4">
                  System Status
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Live monitoring active
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    Desk tracking enabled
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    Auto refresh enabled
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    Real-time occupancy updates
                  </div>
                </div>
              </div>
            </div>

            {/* Abandoned desks */}
            <div>
              <p className="text-[15px] font-semibold text-ink mb-3">Abandoned desks — manual override</p>
              {abandoned.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-700 font-medium">
                    <IconCheck size={18} />
                    No abandoned desks detected.
                  </div>

                  <p className="text-sm text-green-600 mt-1">
                    All desks are currently being monitored normally.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {abandoned.map(d => (
                    <div key={d.id} className="bg-card border border-[#FFC9C9] rounded flex items-center gap-3 px-4 py-3.5">
                      <span className="text-sm font-bold text-ink">{d.desk_code}</span>
                      <span className="text-xs text-ink3">Zone {d.section}</span>
                      <button
                        onClick={() => handleReset(d.desk_code)}
                        disabled={reset.isPending}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded border border-line2 bg-card hover:bg-panel text-xs font-medium transition disabled:opacity-60"
                      >
                        <IconRefresh size={12} />
                        Reset
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── FLOOR MAP TAB ── */}
        {tab === 'map' && (
          <>
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h2 className="text-[15px] font-semibold text-ink">Full library map</h2>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'Free', cls: 'mp-free' },
                  { label: 'Occupied', cls: 'mp-occupied' },
                  { label: 'Away', cls: 'mp-away' },
                  { label: 'Abandoned', cls: 'mp-abandoned' },
                ].map(({ label, cls }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-ink3">
                    <div className={`w-[11px] h-[11px] rounded-[3px] ${cls}`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
            {isLoading ? (
              <div className="bg-card border border-line rounded-lg p-12 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <DeskMap desks={mapDesks} onDeskClick={d => setSelectedDesk(d)} />
            )}
          </>
        )}

        {/* ── DESK LOG TAB ── */}
        {tab === 'log' && (
          <>
            <p className="text-[15px] font-semibold text-ink">All desks</p>
            <div className="bg-card border border-line rounded-lg overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[13px] border-collapse">
                    <thead>
                      <tr className="bg-panel border-b border-line">
                        {['Desk', 'Zone', 'Status', 'Occupied by', 'Time active', 'Action'].map(h => (
                          <th key={h} className="px-3.5 py-2.5 text-left text-[11px] font-semibold text-ink3 uppercase tracking-[0.4px]">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {desks?.map(d => {
                        const hasPrompt = !!d.occupant?.prompt_sent_at
                        return (
                          <tr key={d.id} className={`border-b border-line last:border-0 ${hasPrompt ? 'bg-warn-light' : 'hover:bg-panel'}`}>
                            <td className="px-3.5 py-2.5 font-bold text-ink">{d.desk_code}</td>
                            <td className="px-3.5 py-2.5 text-ink3">Zone {d.section}</td>
                            <td className="px-3.5 py-2.5">
                              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${STATUS_PILL[d.status]}`}>
                                {d.status}
                              </span>
                            </td>
                            <td className="px-3.5 py-2.5 text-ink2">
                              {d.occupant ? d.occupant.name : '—'}
                              {hasPrompt && (
                                <span className="ml-2 text-[10px] font-semibold text-warn bg-warn-light px-1.5 py-0.5 rounded">
                                  Prompt sent
                                </span>
                              )}
                            </td>
                            <td className="px-3.5 py-2.5 text-ink3 tabular-nums">
                              {d.occupant ? elapsed(d.occupant.checked_in_at) + ' ago' : '—'}
                            </td>
                            <td className="px-3.5 py-2.5">
                              {d.status !== 'FREE' ? (
                                <button
                                  onClick={() => handleReset(d.desk_code)}
                                  disabled={reset.isPending}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded border border-line2 bg-card hover:bg-panel text-xs font-medium transition disabled:opacity-60"
                                >
                                  <IconRefresh size={11} />
                                  Reset
                                </button>
                              ) : (
                                <span className="text-ink3">—</span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Desk info modal (librarian context) ── */}
      {selectedDesk && (
        <DeskInfoModal
          desk={selectedDesk}
          myBooking={null}
          isLibrarian
          onClose={() => setSelectedDesk(null)}
          onReset={handleReset}
        />
      )}
    </div>
  )
}
