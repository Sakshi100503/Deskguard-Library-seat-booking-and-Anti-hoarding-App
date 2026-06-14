import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import useAuthStore from './store/authStore'
import LandingPage   from './pages/LandingPage'
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'
import StudentPage   from './pages/StudentPage'
import LibrarianPage from './pages/LibrarianPage'
import QRCheckinPage from './pages/QRCheckinPage'

const queryClient = new QueryClient()

function RequireAuth({ children }) {
  const token = useAuthStore(s => s.token)
  if (!token) return <Navigate to="/login" replace />
  return children
}

function RequireRole({ role, children }) {
  const user = useAuthStore(s => s.user)
  if (!user) return null
  if (user.role !== role) return <Navigate to={user.role === 'librarian' ? '/admin' : '/app'} replace />
  return children
}

function AppContent() {
  const { token, fetchMe } = useAuthStore()
  useEffect(() => { if (token) fetchMe() }, [token])

  return (
    <Routes>
      <Route path="/"              element={<LandingPage />} />
      <Route path="/login"         element={<LoginPage />} />
      <Route path="/register"      element={<RegisterPage />} />

      <Route path="/app" element={
        <RequireAuth>
          <RequireRole role="student">
            <StudentPage />
          </RequireRole>
        </RequireAuth>
      } />

      <Route path="/admin" element={
        <RequireAuth>
          <RequireRole role="librarian">
            <LibrarianPage />
          </RequireRole>
        </RequireAuth>
      } />

      <Route path="/checkin/:deskCode" element={
        <RequireAuth>
          <QRCheckinPage />
        </RequireAuth>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
