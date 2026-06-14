import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { IconArmchair, IconCheck, IconX } from '@tabler/icons-react'
import { useCheckIn } from '../hooks/useDesks'
import useAuthStore from '../store/authStore'

export const PENDING_KEY = 'deskguard_pending_checkin'

export default function QRCheckinPage() {
  const { deskCode } = useParams()
  const navigate     = useNavigate()
  const token        = useAuthStore(s => s.token)
  const checkIn      = useCheckIn()
  const [status,  setStatus]  = useState('checking')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      sessionStorage.setItem(PENDING_KEY, deskCode)
      navigate('/login', { replace: true })
      return
    }
    checkIn.mutate(
      { desk_code: deskCode },
      {
        onSuccess: data => {
          setStatus('success')
          setMessage(data.message || `Checked in to ${deskCode}`)
          setTimeout(() => navigate('/app', { replace: true }), 1800)
        },
        onError: err => {
          setStatus('error')
          setMessage(err.response?.data?.detail || 'Check-in failed')
        },
      }
    )
  }, [deskCode, token])

  const config = {
    checking: {
      bg: 'bg-primary-light',
      icon: <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />,
      title: `Checking in to ${deskCode}…`,
    },
    success: {
      bg: 'bg-success-light',
      icon: <IconCheck size={28} className="text-success" />,
      title: 'Checked in!',
    },
    error: {
      bg: 'bg-danger-light',
      icon: <IconX size={28} className="text-danger" />,
      title: 'Check-in failed',
    },
  }

  const { bg, icon, title } = config[status]

  return (
    <div className="min-h-screen bg-page flex items-center justify-center p-4">
      <div className="bg-card border border-line rounded-lg shadow-sm p-8 w-full max-w-[300px] text-center">
        <div className="flex items-center justify-center gap-2 font-semibold text-sm text-ink mb-6">
          <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white">
            <IconArmchair size={14} />
          </div>
          DeskGuard
        </div>

        <div className={`w-[56px] h-[56px] rounded-full ${bg} flex items-center justify-center mx-auto mb-4`}>
          {icon}
        </div>

        <h2 className="text-lg font-bold text-ink mb-1">{title}</h2>
        {message && <p className="text-sm text-ink2 mt-1">{message}</p>}
        {status === 'success' && (
          <p className="text-xs text-ink3 mt-3">Redirecting to the map…</p>
        )}
        {status === 'error' && (
          <button
            onClick={() => navigate('/app')}
            className="mt-4 w-full py-2 rounded border border-line2 hover:bg-panel text-sm text-ink font-medium transition"
          >
            Back to map
          </button>
        )}
      </div>
    </div>
  )
}
