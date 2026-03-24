import { useEffect, useState } from 'react'
import type { Opportunity } from '../../types/youtube'
import { motion } from 'framer-motion'
import { TrendingUp, AlertCircle, Clock } from 'lucide-react'
import { useChannelStore } from '../../store/channel'
import { getOpportunities } from '../../services/gemini'

export default function OpportunityCard({ channelId, goalMode }: { channelId?: string, goalMode: string | null }) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(false)
  const { channel, videos, analytics } = useChannelStore()

  useEffect(() => {
    if (!channelId) return
    const fetchOpp = async () => {
      setLoading(true)
      try {
        const data = await getOpportunities(channel, videos, analytics, goalMode || 'Growth')
        setOpportunities(data.opportunities || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOpp()
  }, [channelId, goalMode, channel, videos, analytics])

  if (loading) return <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Analyzing opportunities...</div>

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Growth Opportunities</h3>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-elevated)', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}>AI Generated</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {opportunities.map((opp, i) => {
          const Icon = opp.type === 'trending_topic' ? TrendingUp : opp.type === 'timing_gap' ? Clock : AlertCircle
          const color = opp.estimatedImpact === 'high' ? 'var(--coral)' : opp.estimatedImpact === 'medium' ? 'var(--amber)' : 'var(--sky)'
          const dim = opp.estimatedImpact === 'high' ? 'var(--coral-dim)' : opp.estimatedImpact === 'medium' ? 'var(--amber-dim)' : 'var(--sky-dim)'

          return (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', gap: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: dim, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                <Icon size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{opp.title}</h4>
                  <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color, background: dim, padding: '2px 6px', borderRadius: 4 }}>{opp.estimatedImpact} Impact</span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{opp.description}</p>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--brand-light)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--brand-light)' }} />
                  {opp.action}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
