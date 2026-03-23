import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import type { AudienceData } from '../../types/youtube'

const COLORS = ['var(--brand)', 'var(--sky)', 'var(--teal)', 'var(--amber)', 'var(--coral)']

export default function AudienceBreakdown({ audience }: { audience: AudienceData | null }) {
  if (!audience || !audience.ageGroups || audience.ageGroups.length === 0) {
    return <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>No audience data</div>
  }

  const data = audience.ageGroups.map(a => ({ name: a.label, value: a.percentage }))

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, height: 360, display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Audience Demographics</h3>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center' }}>
        <ResponsiveContainer width="50%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ width: '50%', paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {data.map((entry, index) => (
            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[index % COLORS.length] }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{entry.name}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
