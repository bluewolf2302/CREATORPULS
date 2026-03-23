import { useEffect } from 'react'
import { useAuthStore } from '../../store/auth'
import { useChannelStore } from '../../store/channel'
import { useGoalStore } from '../../store/goalMode'
import MetricCard from '../../components/dashboard/MetricCard'
import PerformanceChart from '../../components/dashboard/PerformanceChart'
import AudienceBreakdown from '../../components/dashboard/AudienceBreakdown'
import VideoTable from '../../components/dashboard/VideoTable'
import OpportunityCard from '../../components/dashboard/OpportunityCard'
import StrategyPreview from '../../components/dashboard/StrategyPreview'
import {
  computeAvgViews,
  computeAvgEngagement,
  computeGrowthRate,
  computeDeltaPercent,
} from '../../lib/utils/analytics'

export default function DashboardPage() {
  const { accessToken, guestChannelId } = useAuthStore()
  const { channel, videos, analytics, audience, isLoading, fetchAll } = useChannelStore()
  const { goalMode } = useGoalStore()

  useEffect(() => {
    if (accessToken || guestChannelId) {
      fetchAll(accessToken, guestChannelId)
    }
  }, [accessToken, guestChannelId])

  if (isLoading) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading your channel data...</div>

  const avgViews = computeAvgViews(videos)
  const avgEng = computeAvgEngagement(videos)
  const growthRate = computeGrowthRate(analytics)
  const totalWatchHours = Math.round(
    analytics.reduce((s, d) => s + d.watchTimeMinutes, 0) / 60
  )
  const viewsDelta = computeDeltaPercent(analytics, 'views')
  const subDelta = computeDeltaPercent(analytics, 'subscriberGain')

  // Build sparkline data from analytics
  const viewsSparkline = analytics?.slice(-8).map(d => d.views) || []
  const subSparkline = analytics?.slice(-8).map(d => d.subscriberGain) || []
  const engSparkline = videos?.slice(-8).map(v => v.engagementRate) || []
  const watchSparkline = analytics?.slice(-8).map(d => d.watchTimeMinutes / 60) || []

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        <MetricCard
          label={accessToken && !guestChannelId ? "Views (Last 28 Days)" : "Lifetime Views"}
          value={accessToken && !guestChannelId ? analytics.reduce((s, d) => s + d.views, 0) : (channel?.totalViews || 0)}
          accent="sky"
          delta={accessToken && !guestChannelId ? viewsDelta : undefined}
          sparkline={accessToken && !guestChannelId ? viewsSparkline : undefined}
          icon="Eye"
        />
        <MetricCard
          label="Subscribers"
          value={channel?.subscriberCount || 0}
          accent="brand"
          delta={accessToken && !guestChannelId ? subDelta : undefined}
          sparkline={accessToken && !guestChannelId ? subSparkline : undefined}
          icon="Users"
        />
        <MetricCard
          label="Engagement Rate"
          value={avgEng}
          suffix="%"
          accent="teal"
          delta={accessToken && !guestChannelId ? computeDeltaPercent(analytics, 'likes') : undefined}
          sparkline={engSparkline}
          icon="Heart"
          isFloat
        />
        <MetricCard
          label={accessToken && !guestChannelId ? "Watch Hours (28 Days)" : "Video Count"}
          value={accessToken && !guestChannelId ? totalWatchHours : (channel?.videoCount || 0)}
          accent="amber"
          sparkline={accessToken && !guestChannelId ? watchSparkline : undefined}
          icon={accessToken && !guestChannelId ? "Clock" : "Video"}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '62% 38%', gap: '16px' }}>
        {accessToken && !guestChannelId ? (
          <>
            <PerformanceChart analytics={analytics} />
            <AudienceBreakdown audience={audience} />
          </>
        ) : (
          <div style={{ gridColumn: '1 / -1', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 32, textAlign: 'center', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: 8 }}><strong>Private Analytics Hidden</strong></p>
            <p style={{ fontSize: 14 }}>Detailed performance charts and audience demographics are only available for channels you own. Sign in with Google to view this data.</p>
          </div>
        )}
      </div>

      {/* Top videos */}
      <VideoTable videos={videos} />

      {/* Opportunities + Strategy */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <OpportunityCard channelId={channel?.id} goalMode={goalMode} />
        <StrategyPreview channelId={channel?.id} goalMode={goalMode} />
      </div>

    </div>
  )
}
