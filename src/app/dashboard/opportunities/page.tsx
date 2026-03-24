import { useEffect, useState } from 'react'
import { useChannelStore } from '../../../store/channel'
import { useGoalStore } from '../../../store/goalMode'
import type { Opportunity } from '../../../types/youtube'
import { motion } from 'framer-motion'
import { TrendingUp, AlertCircle, Clock, RefreshCw } from 'lucide-react'
import { formatNum } from '../../../lib/utils/formatters'

import { getOpportunities } from '../../../services/gemini'

export default function OpportunitiesPage() {
  const { channel, videos, analytics } = useChannelStore()
  const { goalMode } = useGoalStore()
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(false)

  const fetchOpportunities = async () => {
    if (!channel?.id) return
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

  useEffect(() => { fetchOpportunities() }, [channel?.id, goalMode])

  // Gap analysis: find videos in bottom 20% engagement but top 30% impressions
  const underperforming = videos
    .filter(v => v.views > 0)
    .sort((a, b) => a.engagementRate - b.engagementRate)
    .slice(0, 5)

  return (
    <div style={{ padding: 24, display: 'flex', gap: 24, height: '100%' }}>
      {/* AI Opportunities */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700 }}>Growth Opportunities</h2>
          <button onClick={fetchOpportunities} disabled={loading} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Analyzing your channel data...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {opportunities.map((opp, i) => {
              const Icon = opp.type === 'trending_topic' ? TrendingUp : opp.type === 'timing_gap' ? Clock : AlertCircle
              const color = opp.estimatedImpact === 'high' ? 'var(--coral)' : opp.estimatedImpact === 'medium' ? 'var(--amber)' : 'var(--sky)'
              const dim = opp.estimatedImpact === 'high' ? 'var(--coral-dim)' : opp.estimatedImpact === 'medium' ? 'var(--amber-dim)' : 'var(--sky-dim)'

              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', gap: 20 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: dim, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                    <Icon size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{opp.title}</h3>
                      <span style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', color, background: dim, padding: '4px 8px', borderRadius: 4 }}>{opp.estimatedImpact} Impact</span>
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>{opp.description}</p>
                    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-dim)', color: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>1</div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{opp.action}</div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Gap Analysis */}
      <div style={{ width: 360, background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)', padding: 24, display: 'flex', flexDirection: 'column', gap: 20, overflowY: 'auto' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Gap Analysis</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>Videos with high impressions but low engagement. Consider updating thumbnails or titles.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {underperforming.map(video => (
            <div key={video.id} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <img src={video.thumbnailUrl} alt={video.title} style={{ width: 80, height: 45, borderRadius: 6, objectFit: 'cover' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{formatNum(video.views)} views</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-input)', padding: '8px 12px', borderRadius: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Engagement Rate</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--coral)', fontFamily: 'var(--font-mono)' }}>{video.engagementRate}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
