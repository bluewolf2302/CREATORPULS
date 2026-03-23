import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoalStore } from '../../../store/goalMode'
import { motion } from 'framer-motion'
import { Eye, Users, DollarSign } from 'lucide-react'

export default function GoalSetupPage() {
  const [selected, setSelected] = useState<string | null>(null)
  const { setGoalMode } = useGoalStore()
  const navigate = useNavigate()

  const handleContinue = () => {
    if (!selected) return
    setGoalMode(selected as any)
    navigate('/dashboard')
  }

  const goals = [
    { id: 'grow_views', icon: Eye, title: 'Grow Views', desc: 'Focus on reach, CTR, and algorithm optimization.', color: 'var(--sky)' },
    { id: 'grow_subscribers', icon: Users, title: 'Grow Subscribers', desc: 'Focus on community, retention, and loyalty.', color: 'var(--brand-light)' },
    { id: 'monetize', icon: DollarSign, title: 'Monetize', desc: 'Focus on high-RPM niches and sponsorships.', color: 'var(--amber)' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'var(--bg-base)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: 800, width: '100%', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 800, marginBottom: 16 }}>What's your primary goal?</h1>
        <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 48 }}>
          CreatorPulse uses your goal to tailor AI insights and recommendations.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 48 }}>
          {goals.map((goal) => {
            const isSelected = selected === goal.id
            return (
              <motion.button
                key={goal.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelected(goal.id)}
                style={{
                  background: isSelected ? 'var(--brand-dim)' : 'var(--bg-surface)',
                  border: `2px solid ${isSelected ? 'var(--brand)' : 'var(--border-subtle)'}`,
                  borderRadius: 'var(--radius-xl)',
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 16,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {isSelected && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'var(--brand)' }} />}
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: isSelected ? goal.color : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? 'white' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
                  <goal.icon size={32} />
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{goal.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{goal.desc}</p>
              </motion.button>
            )
          })}
        </div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: selected ? 1 : 0.5 }}
          disabled={!selected}
          onClick={handleContinue}
          style={{
            background: 'var(--brand)',
            color: 'white',
            border: 'none',
            padding: '16px 48px',
            borderRadius: 'var(--radius-full)',
            fontSize: 18,
            fontWeight: 600,
            cursor: selected ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            boxShadow: selected ? '0 8px 24px var(--brand-glow)' : 'none'
          }}
        >
          Continue to Dashboard
        </motion.button>
      </motion.div>
    </div>
  )
}
