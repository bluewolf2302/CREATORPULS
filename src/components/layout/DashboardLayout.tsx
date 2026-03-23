import { Outlet, Navigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import AICopilot from './AICopilot'
import { useAuthStore } from '../../store/auth'

export default function DashboardLayout() {
  const { accessToken, guestChannelId } = useAuthStore()

  if (!accessToken && !guestChannelId) {
    return <Navigate to="/login" replace />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <TopBar />
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
          <Outlet />
        </main>
      </div>
      <AICopilot />
    </div>
  )
}
