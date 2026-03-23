import { useChannelStore } from '../../../store/channel'
import { useAuthStore } from '../../../store/auth'
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import { formatDateShort, formatNum } from '../../../lib/utils/formatters'
import { Lock } from 'lucide-react'

export default function AnalyticsPage() {
  const { analytics, audience, videos } = useChannelStore()
  const { accessToken, guestChannelId } = useAuthStore()

  if (!accessToken || guestChannelId) {
    return (
      <div style={{ padding: 48, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
        <Lock size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Private Data</h2>
        <p style={{ maxWidth: 400, textAlign: 'center', lineHeight: 1.6 }}>
          Detailed analytics and audience insights are only available for channels you own. Please log in with Google to view this data.
        </p>
      </div>
    )
  }

  const engagementData = analytics.map(d => ({
    date: formatDateShort(d.date),
    views: d.views,
    engagement: d.likes + d.comments
  }))

  const peakHours = audience?.peakHours || Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => Math.floor(Math.random() * 100)))
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Engagement Breakdown (Last 28 Days)</h3>
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={engagementData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis yAxisId="left" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => formatNum(val)} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => formatNum(val)} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="views" name="Views" fill="var(--sky)" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="engagement" name="Engagement (Likes + Comments)" stroke="var(--brand)" strokeWidth={3} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 24 }}>Best Time to Post</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '40px repeat(24, 1fr)', gap: 4 }}>
          <div />
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{ fontSize: 10, color: 'var(--text-secondary)', textAlign: 'center' }}>{i % 12 === 0 ? 12 : i % 12}{i < 12 ? 'a' : 'p'}</div>
          ))}
          {days.map((day, dIdx) => (
            <div key={day} style={{ display: 'contents' }}>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>{day}</div>
              {peakHours[dIdx].map((val, hIdx) => (
                <div key={`${dIdx}-${hIdx}`} style={{ position: 'relative', height: 24, borderRadius: 4, overflow: 'hidden', background: 'var(--bg-elevated)' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'var(--brand)', opacity: val / 100 }} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
