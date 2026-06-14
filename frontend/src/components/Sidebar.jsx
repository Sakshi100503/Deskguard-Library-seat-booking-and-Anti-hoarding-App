import { NavLink } from 'react-router-dom'
import useAuthStore from '../store/authStore'

function MapIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

function DashIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

export default function Sidebar() {
  const { user, logout } = useAuthStore()

  const navItems = [
    { to: '/', label: 'Desk Map', icon: MapIcon },
    ...(user?.role === 'librarian' ? [{ to: '/librarian', label: 'Admin', icon: DashIcon }] : []),
  ]

  return (
    <aside className="w-60 shrink-0 bg-sidebar border-r border-border flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-primary inline-block" />
          <span className="text-heading font-bold text-base tracking-widest">DESKGUARD</span>
        </div>
        <p className="text-muted text-xs mt-0.5">Library Desk Manager</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-border/50 hover:text-heading'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      {user && (
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-heading truncate">{user.name}</p>
              <p className="text-xs text-muted capitalize">{user.role}</p>
            </div>
            <button
              onClick={logout}
              title="Sign out"
              className="ml-2 p-1.5 text-muted hover:text-status-occupied hover:bg-red-50 rounded-lg transition"
            >
              <LogoutIcon />
            </button>
          </div>
        </div>
      )}
    </aside>
  )
}
