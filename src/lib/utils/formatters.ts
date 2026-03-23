export function formatNum(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return n.toLocaleString()
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  return `${m}:${String(s).padStart(2,'0')}`
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function calcHealthScore(
  engagementRate: number,
  avgViews: number,
  uploadsPerMonth: number,
  subGrowthRate: number
): number {
  // Weighted health score 0–100
  const engScore   = Math.min(engagementRate * 10, 30)      // max 30 pts
  const viewScore  = Math.min((avgViews / 10000) * 25, 25)  // max 25 pts
  const postScore  = Math.min(uploadsPerMonth * 2.5, 25)     // max 25 pts, 10 uploads = full
  const growScore  = Math.min(subGrowthRate * 5, 20)         // max 20 pts

  return Math.round(Math.min(100, engScore + viewScore + postScore + growScore))
}
