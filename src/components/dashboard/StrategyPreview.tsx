import { useEffect, useState } from 'react'
import type { StrategyPlan } from '../../types/youtube'
import { motion } from 'framer-motion'
import { Calendar, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useChannelStore } from '../../store/channel'
import { getStrategy } from '../../services/gemini'

export default function StrategyPreview({ channelId, goalMode }: { channelId?: string, goalMode: string | null }) {
  const [strategy, setStrategy] = useState<StrategyPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const { channel, videos, analytics } = useChannelStore()

  useEffect(() => {
    if (!channelId) return
    const fetchStrat = async () => {
      setLoading(true)
      try {
        const data = await getStrategy(channel, videos, analytics, goalMode || 'Growth')
        setStrategy(data)

        // Save strategy to Firestore
        try {
          const { auth, db } = await import('../../firebase')
          const { collection, addDoc } = await import('firebase/firestore')
          if (auth.currentUser) {
            await addDoc(collection(db, 'strategies'), {
              userId: auth.currentUser.uid,
              channelId,
              goalMode: goalMode || 'grow_views',
              plan: JSON.stringify(data.plan),
              createdAt: new Date().toISOString()
            })
          }
        } catch (e) {
          console.error('Failed to save strategy to Firestore', e)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStrat()
  }, [channelId, goalMode, channel, videos, analytics])

  if (loading) return <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Generating strategy...</div>

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>This Week's Strategy</h3>
        <Link to="/dashboard/calendar" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--brand-light)', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          View Calendar <ChevronRight size={14} />
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {strategy?.plan?.slice(0, 3).map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--brand-dim)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-light)', flexShrink: 0 }}>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{item.day.substring(0, 3)}</span>
              <Calendar size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', color: 'var(--teal)', background: 'var(--teal-dim)', padding: '2px 6px', borderRadius: 4 }}>{item.format}</span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{item.estimatedReachMultiplier}x Reach</span>
              </div>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</h4>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.reasoning}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
