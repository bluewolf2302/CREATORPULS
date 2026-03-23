import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, BarChart2, Calendar, Lightbulb, Calculator, Hash, Settings, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/auth'
import { useChannelStore } from '../../store/channel'

const NAV_ITEMS = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', path: '/dashboard/analytics', icon: BarChart2 },
  { label: 'Calendar', path: '/dashboard/calendar', icon: Calendar },
  { label: 'Opportunities', path: '/dashboard/opportunities', icon: Lightbulb },
  { label: 'Simulator', path: '/dashboard/simulator', icon: Calculator },
  { label: 'Hashtag Tool', path: '/dashboard/tools/hashtag', icon: Hash },
]

export default function Sidebar() {
  const location = useLocation()
  const { setAccessToken, accessToken, setGuestChannelId } = useAuthStore()
  const { channel } = useChannelStore()

  const handleLogout = async () => {
    try {
      const { auth } = await import('../../firebase')
      await auth.signOut()
    } catch (e) {
      console.error(e)
    }
    setAccessToken(null)
    setGuestChannelId(null)
  }

  return (
    <div style={{ width: 240, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 32, height: 32, background: 'var(--brand)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
          CP
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>CreatorPulse</span>
      </div>

      <div style={{ padding: '0 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV_ITEMS.map(item => {
          const isActive = location.pathname === item.path
          const Icon = item.icon
          return (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 'var(--radius-md)',
              background: isActive ? 'var(--brand-dim)' : 'transparent',
              color: isActive ? 'var(--brand-light)' : 'var(--text-secondary)',
              textDecoration: 'none', fontSize: 14, fontWeight: isActive ? 600 : 500,
              transition: 'all 0.2s'
            }}>
              <Icon size={18} />
              {item.label}
            </Link>
          )
        })}
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)' }}>
        {channel && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <img src={channel.thumbnailUrl} alt={channel.name} style={{ width: 36, height: 36, borderRadius: '50%' }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{channel.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{channel.handle}</div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', width: '100%', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
          <LogOut size={18} />
          {accessToken ? 'Sign Out' : 'Exit Channel'}
        </button>
      </div>
    </div>
  )
}
