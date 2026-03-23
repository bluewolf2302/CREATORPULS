import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import Sparkline from '../ui/Sparkline'
import { formatNum } from '../../lib/utils/formatters'

interface MetricCardProps {
  label: string
  value: number
  suffix?: string
  accent: 'sky' | 'brand' | 'teal' | 'amber'
  delta?: number
  sparkline?: number[]
  icon: string
  isFloat?: boolean
}

const accentColors = {
  sky:   { color: '#38b2ff', dim: 'rgba(56,178,255,0.12)',   gradient: 'linear-gradient(90deg,#38b2ff,transparent)' },
  brand: { color: '#9b8ae1', dim: 'rgba(110,86,207,0.14)',   gradient: 'linear-gradient(90deg,#9b8ae1,transparent)' },
  teal:  { color: '#00d4aa', dim: 'rgba(0,212,170,0.12)',    gradient: 'linear-gradient(90deg,#00d4aa,transparent)' },
  amber: { color: '#f5a623', dim: 'rgba(245,166,35,0.12)',   gradient: 'linear-gradient(90deg,#f5a623,transparent)' },
}

export default function MetricCard({ label, value, suffix='', accent, delta, sparkline, icon, isFloat }: MetricCardProps) {
  const { color, dim, gradient } = accentColors[accent]
  const countRef = useRef<HTMLDivElement>(null)
  const Icon = (LucideIcons as any)[icon]

  // Count-up animation
  useEffect(() => {
    if (!countRef.current) return
    const start = performance.now()
    const duration = 1200
    const animate = (now: number) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      const cur = value * ease
      if (countRef.current) {
        countRef.current.textContent = isFloat
          ? cur.toFixed(2) + suffix
          : formatNum(Math.round(cur)) + suffix
      }
      if (p < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background: gradient }} />

      {/* Icon */}
      {Icon && (
        <div style={{ width:32, height:32, background: dim, borderRadius: 'var(--radius-sm)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
          <Icon size={16} color={color} />
        </div>
      )}

      {/* Label */}
      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, textTransform:'uppercase', letterSpacing:'0.09em', color:'var(--text-secondary)', marginBottom:8 }}>
        {label}
      </div>

      {/* Value */}
      <div ref={countRef} style={{ fontFamily:'var(--font-mono)', fontSize:36, fontWeight:600, lineHeight:1, color, marginBottom:8 }}>
        {isFloat ? value.toFixed(2) + suffix : formatNum(value) + suffix}
      </div>

      {/* Delta */}
      {delta !== undefined && (
        <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:11, color:'var(--text-secondary)' }}>
          <span style={{
            fontFamily:'var(--font-mono)', fontSize:10, padding:'2px 7px', borderRadius:'var(--radius-full)',
            background: delta >= 0 ? 'rgba(0,212,170,0.12)' : 'rgba(255,94,69,0.12)',
            color: delta >= 0 ? '#00d4aa' : '#ff5e45',
          }}>
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}%
          </span>
          <span>vs last week</span>
        </div>
      )}

      {/* Sparkline */}
      {sparkline && sparkline.length > 0 && (
        <div style={{ marginTop: 14, height: 28 }}>
          <Sparkline data={sparkline} color={color} />
        </div>
      )}
    </motion.div>
  )
}
