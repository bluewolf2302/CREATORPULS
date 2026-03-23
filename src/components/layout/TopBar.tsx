import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

export default function TopBar() {
  const location = useLocation()
  
  const getTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Overview'
      case '/dashboard/analytics': return 'Analytics'
      case '/dashboard/calendar': return 'Content Calendar'
      case '/dashboard/opportunities': return 'Growth Opportunities'
      case '/dashboard/simulator': return 'What-If Simulator'
      case '/dashboard/tools/hashtag': return 'Hashtag Generator'
      default: return 'Dashboard'
    }
  }

  return (
    <div style={{ height: 72, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', position: 'sticky', top: 0, zIndex: 10 }}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>
        {getTitle()}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input type="text" placeholder="Search videos or metrics..." style={{
            background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)',
            padding: '8px 16px 8px 40px', fontSize: 14, color: 'var(--text-primary)', width: 280, outline: 'none'
          }} />
        </div>
        
        <button style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <Bell size={20} color="var(--text-secondary)" />
          <span style={{ position: 'absolute', top: 8, right: 8, width: 8, height: 8, background: 'var(--coral)', borderRadius: '50%', border: '2px solid var(--bg-elevated)' }} />
        </button>
      </div>
    </div>
  )
}
