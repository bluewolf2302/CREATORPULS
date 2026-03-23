import type { VideoItem } from '../../types/youtube'
import { formatNum, formatDuration, formatDateShort } from '../../lib/utils/formatters'
import { Play } from 'lucide-react'

export default function VideoTable({ videos }: { videos: VideoItem[] }) {
  if (!videos || videos.length === 0) return <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, textAlign: 'center', color: 'var(--text-secondary)' }}>No videos found</div>

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: 24, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Top Performing Videos</h3>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--brand-light)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>View All</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '12px 16px', fontWeight: 600 }}>Video</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Views</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Engagement</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Duration</th>
              <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Published</th>
            </tr>
          </thead>
          <tbody>
            {videos.slice(0, 5).map(video => (
              <tr key={video.id} style={{ borderBottom: '1px solid var(--border-faint)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background = 'var(--bg-elevated)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ position: 'relative', width: 120, height: 68, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-input)' }}>
                    <img src={video.thumbnailUrl} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="play-overlay">
                      <Play size={24} color="white" fill="white" />
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{video.likes.toLocaleString()} likes • {video.comments.toLocaleString()} comments</div>
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500 }}>{formatNum(video.views)}</td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 8px', borderRadius: 'var(--radius-full)', background: 'var(--teal-dim)', color: 'var(--teal)', fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                    {video.engagementRate}%
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-secondary)' }}>{formatDuration(video.durationSeconds)}</td>
                <td style={{ padding: '16px', textAlign: 'right', fontSize: 13, color: 'var(--text-secondary)' }}>{formatDateShort(video.publishedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
