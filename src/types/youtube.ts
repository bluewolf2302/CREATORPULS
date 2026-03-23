export interface ChannelData {
  id: string
  name: string
  handle: string
  description: string
  thumbnailUrl: string
  bannerUrl: string
  subscriberCount: number
  totalViews: number
  videoCount: number
  joinedDate: Date
  country: string
}

export interface VideoItem {
  id: string
  title: string
  description: string
  publishedAt: Date
  thumbnailUrl: string
  views: number
  likes: number
  comments: number
  durationSeconds: number
  engagementRate: number
  tags: string[]
}

export interface DailyMetric {
  date: Date
  views: number
  likes: number
  comments: number
  watchTimeMinutes: number
  avgViewDurationSec: number
  subscriberGain: number
  impressions: number
  ctr: number
}

export interface AudienceData {
  ageGroups: { label: string; percentage: number }[]
  topCountries: { name: string; viewPercentage: number }[]
  deviceTypes: { name: string; percentage: number }[]
  peakHours: number[][]  // [7 days][24 hours], values 0–100
}

export interface StrategyPlan {
  plan: {
    day: string
    format: string
    title: string
    keyword: string
    reasoning: string
    estimatedReachMultiplier: number
  }[]
}

export interface Opportunity {
  type: 'content_gap' | 'trending_topic' | 'timing_gap'
  title: string
  description: string
  action: string
  estimatedImpact: 'high' | 'medium' | 'low'
}

export interface SimulationResult {
  projections: { week: number; subscribers: number; views: number }[]
  summary: {
    projectedSubscriberGain: number
    projectedViewIncrease: number
    projectedRevenueImpact: number
    confidenceLevel: string
    keyInsight: string
  }
}

export interface HashtagResult {
  broad: string[]
  niche: string[]
  micro: string[]
  titleVariants: { title: string; estimatedCTR: number }[]
  descriptionKeywords: string[]
}

export interface CalendarEntry {
  id: string
  title: string
  date: string          // ISO date string
  format: 'Long-form' | 'Short' | 'Premiere' | 'Community Post' | 'Poll'
  status: 'Idea' | 'Scripted' | 'Filmed' | 'Scheduled' | 'Live'
  keyword?: string
  notes?: string
  videoId?: string      // set when live, links to real YouTube video
  realViews?: number    // fetched from YouTube after going live
}
