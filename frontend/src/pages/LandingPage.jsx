import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IconArmchair, IconQrcode, IconClockPause, IconRobot,
  IconBell, IconShield, IconMap, IconCircleCheck,
} from '@tabler/icons-react'
import useAuthStore from '../store/authStore'

const INITIAL_STATUSES = [
  'free','occupied','occupied','away','free','free','occupied','free',
  'free','away','occupied','free','free','free','occupied','free',
  'free','free','occupied','free','abandoned','free','free','occupied',
]

function AnimatedMiniMap() {
  const [statuses, setStatuses] = useState(INITIAL_STATUSES)

  useEffect(() => {
    const id = setInterval(() => {
      setStatuses(prev => {
        const next = [...prev]
        const i = Math.floor(Math.random() * next.length)
        if (next[i] === 'abandoned') return prev
        const cycle = ['free', 'occupied', 'away']
        next[i] = cycle[(cycle.indexOf(next[i]) + 1) % cycle.length]
        return next
      })
    }, 1200)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="bg-card border border-line rounded-lg p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-ink text-sm flex items-center gap-2">
          <span className="w-[7px] h-[7px] rounded-full bg-success-DEFAULT animate-live-pulse inline-block" />
          Live — Zone A
        </h3>
        <span className="text-xs text-ink3">Updates every 60s</span>
      </div>
      <div className="grid grid-cols-8 gap-1.5 mb-4">
        {statuses.map((s, i) => (
          <div key={i} className={`aspect-square rounded-[5px] transition-colors duration-500 mp-${s}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        {[
          { cls: 'mp-free',      label: 'Free' },
          { cls: 'mp-occupied',  label: 'Occupied' },
          { cls: 'mp-away',      label: 'Away' },
          { cls: 'mp-abandoned', label: 'Abandoned' },
        ].map(({ cls, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-ink3">
            <div className={`w-[9px] h-[9px] rounded-[3px] ${cls}`} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: IconMap,        color: 'primary', title: 'Live floor map',    desc: 'Color-coded grid updates in real time as students check in, step away, or time out.' },
  { icon: IconQrcode,     color: 'primary', title: 'QR check-in',       desc: 'Each desk has a unique QR code. Scan to instantly claim your seat.' },
  { icon: IconClockPause, color: 'warn',    title: 'Away mode',         desc: 'Step out for up to 20 minutes without losing your seat. Timer tracks automatically.' },
  { icon: IconRobot,      color: 'warn',    title: 'Auto-abandon',      desc: 'Server sweeps every 60 seconds. Expired desks are released back to the pool.' },
  { icon: IconBell,       color: 'success', title: 'Still here?',       desc: 'At 2 hours, students get a prompt. No response = seat released in 5 minutes.' },
  { icon: IconShield,     color: 'admin',   title: 'Librarian panel',   desc: 'Admin dashboard with live stats, manual overrides, and full desk log.' },
]

const ICON_COLORS = {
  primary: 'bg-primary-light text-primary',
  warn:    'bg-warn-light text-warn',
  success: 'bg-success-light text-success',
  admin:   'bg-admin-light text-admin',
}

export default function LandingPage() {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    if (user?.role === 'librarian') navigate('/admin')
    else if (user?.role === 'student') navigate('/app')
  }, [user])

  return (
    <div className="min-h-screen bg-page">
      {/* ── Navbar ── */}
      <nav className="h-14 bg-card border-b border-line flex items-center justify-between px-8">
        <div className="flex items-center gap-2.5 font-semibold text-[15px] text-ink tracking-tight">
          <div className="w-[30px] h-[30px] bg-primary rounded-[7px] flex items-center justify-center text-white">
            <IconArmchair size={17} />
          </div>
          DeskGuard
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-1.5 rounded border border-line2 bg-card text-ink text-sm font-medium hover:bg-panel transition"
          >
            Sign in
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-1.5 rounded bg-primary text-white text-sm font-medium hover:bg-primary-dark transition"
          >
            Get started →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div className="max-w-5xl mx-auto px-8 pt-14 pb-8 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-primary-light text-primary text-xs font-medium px-3 py-1.5 rounded-full mb-4">
            <IconCircleCheck size={13} />
            Live occupancy tracking
          </div>
          <h1 className="text-[34px] font-bold leading-[1.18] tracking-tight text-ink mb-3">
            End desk hoarding.<br />Give every student{' '}
            <span className="text-primary">a fair seat.</span>
          </h1>
          <p className="text-ink2 text-[15px] leading-[1.7] mb-6">
            Real-time floor map, QR check-in, automatic 2-hour time-outs,
            and a librarian admin panel — all in one place.
          </p>
          <div className="flex gap-2.5">
            <button
              onClick={() => navigate('/register')}
              className="px-5 py-2.5 rounded bg-primary text-white text-sm font-medium hover:bg-primary-dark transition"
            >
              Claim a desk
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2.5 rounded border border-line2 bg-card text-ink text-sm font-medium hover:bg-panel transition"
            >
              Librarian login
            </button>
          </div>
        </div>
        <AnimatedMiniMap />
      </div>

      {/* ── Features ── */}
      <div className="max-w-5xl mx-auto px-8 pb-16">
        <p className="text-xs font-semibold text-primary uppercase tracking-[0.8px] mb-1.5">Key features</p>
        <h2 className="text-[22px] font-bold tracking-tight text-ink mb-6">The whole system, built in.</h2>
        <div className="border border-line rounded-lg overflow-hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-line">
          {FEATURES.map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-card p-5 hover:bg-panel transition-colors">
              <div className={`w-9 h-9 rounded-[8px] flex items-center justify-center mb-3 ${ICON_COLORS[color]}`}>
                <Icon size={18} />
              </div>
              <h3 className="text-sm font-semibold text-ink mb-1">{title}</h3>
              <p className="text-xs text-ink2 leading-[1.6]">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
