import { create } from 'zustand'
import type { ChannelData, VideoItem, DailyMetric, AudienceData } from '../types/youtube'

interface ChannelStore {
  channel: ChannelData | null
  videos: VideoItem[]
  analytics: DailyMetric[]
  audience: AudienceData | null
  isLoading: boolean
  error: string | null
  dateRange: 7 | 14 | 28 | 90
  setDateRange: (days: 7 | 14 | 28 | 90) => void
  fetchAll: (accessToken: string | null, guestChannelId?: string | null) => Promise<void>
}

export const useChannelStore = create<ChannelStore>((set, get) => ({
  channel: null,
  videos: [],
  analytics: [],
  audience: null,
  isLoading: false,
  error: null,
  dateRange: 28,

  setDateRange: (days) => set({ dateRange: days }),

  fetchAll: async (accessToken: string | null, guestChannelId?: string | null) => {
    set({ isLoading: true, error: null })
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
      
      let channelUrl = '/api/youtube/channel'
      if (guestChannelId) channelUrl += `?id=${guestChannelId}`
      
      let videosUrl = '/api/youtube/videos'
      if (guestChannelId) videosUrl += `?channelId=${guestChannelId}`

      const promises: Promise<Response>[] = [
        fetch(channelUrl, { headers }),
        fetch(videosUrl, { headers })
      ]

      if (accessToken) {
        promises.push(fetch(`/api/youtube/analytics?days=${get().dateRange}`, { headers }))
        promises.push(fetch('/api/youtube/audience', { headers }))
      }

      const responses = await Promise.all(promises)
      const channelRes = responses[0]
      const videosRes = responses[1]

      if (!channelRes.ok) throw new Error('Failed to fetch channel data')

      const channel = await channelRes.json()
      const videos = await videosRes.json()
      
      let analytics = []
      let audience = null
      
      if (accessToken) {
        analytics = await responses[2].json()
        audience = await responses[3].json()
      }

      // Re-fetch videos with channelId once we have it (if we didn't already pass it)
      let finalVideos = videos
      if (!guestChannelId) {
        const videosWithIdRes = await fetch(`/api/youtube/videos?channelId=${channel.id}`, { headers })
        finalVideos = await videosWithIdRes.json()
      }

      set({ channel, videos: finalVideos, analytics, audience, isLoading: false })

      // Save channel to Firestore
      try {
        const { auth, db } = await import('../firebase')
        const { doc, setDoc } = await import('firebase/firestore')
        if (auth.currentUser) {
          await setDoc(doc(db, 'channels', channel.id), {
            userId: auth.currentUser.uid,
            channelId: channel.id,
            title: channel.name,
            description: channel.description,
            subscriberCount: channel.subscriberCount,
            viewCount: channel.totalViews,
            videoCount: channel.videoCount,
            thumbnailUrl: channel.thumbnailUrl,
            updatedAt: new Date().toISOString()
          }, { merge: true })
        }
      } catch (e) {
        console.error('Failed to save channel to Firestore', e)
      }
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },
}))
