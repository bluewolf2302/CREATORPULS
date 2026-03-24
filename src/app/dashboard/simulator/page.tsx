import { useState } from 'react'
import { useChannelStore } from '../../../store/channel'
import { useGoalStore } from '../../../store/goalMode'
import type { SimulationResult } from '../../../types/youtube'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatNum } from '../../../lib/utils/formatters'
import { Calculator, Save, Loader2 } from 'lucide-react'

const DEFAULT_SCENARIO = {
  uploadsPerMonth: 4,
  avgVideoLength: '5-15 min',
  usesShorts: false,
  shortsPerWeek: 0,
  adBudget: 0,
  niche: 'current',
  tactics: [],
}

import { simulateGrowth } from '../../../services/gemini'

export default function SimulatorPage() {
  const { channel, videos, analytics } = useChannelStore()
  const { goalMode } = useGoalStore()
  const [scenario, setScenario] = useState(DEFAULT_SCENARIO)
  const [period, setPeriod] = useState(90)
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [savedScenarios, setSavedScenarios] = useState<{ name: string; scenario: typeof DEFAULT_SCENARIO; result: SimulationResult }[]>([])

  const runSimulation = async () => {
    setLoading(true)
    try {
      const data = await simulateGrowth(scenario, period, channel, videos, analytics, goalMode || 'Growth')
      setResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const saveScenario = () => {
    if (!result) return
    const name = `Scenario ${savedScenarios.length + 1}`
    setSavedScenarios(s => [...s, { name, scenario: { ...scenario }, result }])
  }

  const currentSubscribers = channel?.subscriberCount || 0
  const chartData = result?.projections.map((p, i) => ({
    week: `Week ${p.week}`,
    simulated: p.subscribers,
    current: currentSubscribers + (i * (currentSubscribers * 0.005)) // Fake 0.5% weekly growth for baseline
  })) || []

  return (
    <div style={{ padding: 24, display: 'flex', gap: 24, height: '100%' }}>
      {/* Controls */}
      <div style={{ width: 320, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>What-If Simulator</h2>
        
        <div>
          <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
            <span>Uploads / Month</span>
            <span style={{ color: 'var(--brand-light)' }}>{scenario.uploadsPerMonth}</span>
          </label>
          <input type="range" min="1" max="30" value={scenario.uploadsPerMonth} onChange={e => setScenario({ ...scenario, uploadsPerMonth: parseInt(e.target.value) })} style={{ width: '100%', accentColor: 'var(--brand)' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Avg Video Length</label>
          <select value={scenario.avgVideoLength} onChange={e => setScenario({ ...scenario, avgVideoLength: e.target.value })} style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 14, color: 'var(--text-primary)', outline: 'none' }}>
            <option value="< 5 min">&lt; 5 min</option>
            <option value="5-15 min">5-15 min</option>
            <option value="15-30 min">15-30 min</option>
            <option value="> 30 min">&gt; 30 min</option>
          </select>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={scenario.usesShorts} onChange={e => setScenario({ ...scenario, usesShorts: e.target.checked })} style={{ width: 16, height: 16, accentColor: 'var(--brand)' }} />
          <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>Include YouTube Shorts</span>
        </label>

        {scenario.usesShorts && (
          <div>
            <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              <span>Shorts / Week</span>
              <span style={{ color: 'var(--brand-light)' }}>{scenario.shortsPerWeek}</span>
            </label>
            <input type="range" min="1" max="14" value={scenario.shortsPerWeek} onChange={e => setScenario({ ...scenario, shortsPerWeek: parseInt(e.target.value) })} style={{ width: '100%', accentColor: 'var(--brand)' }} />
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Projection Period</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[90, 180, 365].map(days => (
              <button key={days} onClick={() => setPeriod(days)} style={{ flex: 1, background: period === days ? 'var(--brand-dim)' : 'var(--bg-input)', border: `1px solid ${period === days ? 'var(--brand)' : 'var(--border-default)'}`, color: period === days ? 'var(--brand-light)' : 'var(--text-secondary)', padding: '8px 0', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
                {days}d
              </button>
            ))}
          </div>
        </div>

        <button onClick={runSimulation} disabled={loading} style={{ background: 'var(--brand)', color: 'white', border: 'none', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1, marginTop: 'auto' }}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />}
          Run Simulation
        </button>
      </div>

      {/* Results */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24, padding: 24, overflowY: 'auto' }}>
        {result ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>Projected Growth</h3>
              <button onClick={saveScenario} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Save size={16} /> Save Scenario
              </button>
            </div>

            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--brand)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--brand)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCur" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--text-tertiary)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--text-tertiary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="week" stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="var(--text-tertiary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => formatNum(val)} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="current" name="Current Trajectory" stroke="var(--text-tertiary)" strokeWidth={2} fillOpacity={1} fill="url(#colorCur)" />
                  <Area type="monotone" dataKey="simulated" name="Simulated Growth" stroke="var(--brand)" strokeWidth={2} fillOpacity={1} fill="url(#colorSim)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Projected Sub Gain</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--brand-light)' }}>+{formatNum(result.summary.projectedSubscriberGain)}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Projected Views</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--sky)' }}>+{formatNum(result.summary.projectedViewIncrease)}</div>
              </div>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 20 }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Est. Revenue Impact</div>
                <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--amber)' }}>+${formatNum(result.summary.projectedRevenueImpact)}</div>
              </div>
            </div>

            <div style={{ background: 'var(--brand-dim)', border: '1px solid var(--brand-border)', borderRadius: 'var(--radius-lg)', padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0 }}>
                <Calculator size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>AI Insight</h4>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{result.summary.keyInsight}</p>
              </div>
            </div>
          </>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: 16 }}>
            <Calculator size={48} color="var(--border-strong)" />
            <p>Adjust the scenario parameters and run a simulation to see projected growth.</p>
          </div>
        )}
      </div>
    </div>
  )
}
