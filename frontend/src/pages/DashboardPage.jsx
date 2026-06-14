import { useState } from 'react'
import { useDesks } from '../hooks/useDesks'
import { useMyBooking } from '../hooks/useDesks'
import DeskMap from '../components/DeskMap'
import StatusLegend from '../components/StatusLegend'
import ActionPanel from '../components/ActionPanel'
import SessionPanel from '../components/SessionPanel'
import StillHereModal from '../components/StillHereModal'

function RefreshIndicator({ isFetching }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${isFetching ? 'bg-primary animate-pulse' : 'bg-status-free'}`} />
      <span className="text-xs text-muted">{isFetching ? 'Updating…' : 'Live'}</span>
    </div>
  )
}

export default function DashboardPage() {
  const { data: desks, isLoading, isError, isFetching } = useDesks()
  const { data: booking } = useMyBooking()
  const [showStillHere, setShowStillHere] = useState(false)

  return (
    <>
      {showStillHere && booking?.prompt_sent_at && (
        <StillHereModal booking={booking} onDismiss={() => setShowStillHere(false)} />
      )}

      <div className="max-w-5xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-heading">Desk Map</h1>
            <p className="text-sm text-muted mt-0.5">Click any desk for its QR check-in code</p>
          </div>
          <RefreshIndicator isFetching={isFetching} />
        </div>

        <StatusLegend desks={desks ?? []} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Map */}
          <div className="lg:col-span-2">
            {isLoading && (
              <div className="bg-white rounded-2xl border border-border p-12 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            )}
            {isError && (
              <div className="bg-white rounded-2xl border border-border p-8 text-center text-muted text-sm">
                Could not load desk data. Is the backend running?
              </div>
            )}
            {desks && <DeskMap desks={desks} />}
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <SessionPanel onStillHereNeeded={setShowStillHere} />
            <ActionPanel />
          </div>
        </div>
      </div>
    </>
  )
}
