import type { DailyMetric, VideoItem } from '../../types/youtube'

export function computeAvgViews(videos: VideoItem[]): number {
  if (!videos.length) return 0
  return Math.round(videos.reduce((s, v) => s + v.views, 0) / videos.length)
}

export function computeAvgEngagement(videos: VideoItem[]): number {
  if (!videos.length) return 0
  return parseFloat((videos.reduce((s, v) => s + v.engagementRate, 0) / videos.length).toFixed(2))
}

export function computeGrowthRate(analytics: DailyMetric[]): number {
  if (analytics.length < 14) return 0
  const recent = analytics.slice(-7).reduce((s, d) => s + d.subscriberGain, 0)
  const prior  = analytics.slice(-14, -7).reduce((s, d) => s + d.subscriberGain, 0)
  if (prior === 0) return 0
  return parseFloat(((recent - prior) / Math.abs(prior) * 100).toFixed(1))
}

export function findBestPostTime(peakHours: number[][]): { day: string; hour: number } {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  let maxVal = 0
  let bestDay = 0
  let bestHour = 0
  if (!peakHours || peakHours.length === 0) return { day: 'Sunday', hour: 12 }
  peakHours.forEach((dayArr, di) => {
    dayArr.forEach((val, hi) => {
      if (val > maxVal) { maxVal = val; bestDay = di; bestHour = hi }
    })
  })
  return { day: days[bestDay], hour: bestHour }
}

export function computeDeltaPercent(analytics: DailyMetric[], metric: keyof DailyMetric): number {
  if (analytics.length < 14) return 0
  const recent = analytics.slice(-7).reduce((s, d) => s + (Number(d[metric]) || 0), 0)
  const prior  = analytics.slice(-14, -7).reduce((s, d) => s + (Number(d[metric]) || 0), 0)
  if (prior === 0) return 0
  return parseFloat(((recent - prior) / prior * 100).toFixed(1))
}
