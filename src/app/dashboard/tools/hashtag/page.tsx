import { useState } from 'react'
import type { HashtagResult } from '../../../../types/youtube'
import { Hash, Copy, Loader2 } from 'lucide-react'

import { getHashtags } from '../../../../services/gemini'

export default function HashtagPage() {
  const [topic, setTopic] = useState('')
  const [niche, setNiche] = useState('general')
  const [seoMode, setSeoMode] = useState(true)
  const [result, setResult] = useState<HashtagResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const generate = async () => {
    if (!topic.trim()) return
    setLoading(true)
    try {
      const data = await getHashtags(topic, niche, seoMode)
      setResult(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelected(s => s.includes(tag) ? s.filter(t => t !== tag) : [...s, tag])
  }

  const copyAll = (tags: string[]) => {
    navigator.clipboard.writeText(tags.map(t => '#' + t).join(' '))
  }

  return (
    <div style={{ padding: 24, display: 'flex', gap: 24, height: '100%' }}>
      <div style={{ width: 320, background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Hashtag Generator</h2>
        
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Video Topic / Title</label>
          <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. How to start a YouTube channel" style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 14, color: 'var(--text-primary)', outline: 'none' }} />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Niche</label>
          <input type="text" value={niche} onChange={e => setNiche(e.target.value)} placeholder="e.g. Tech, Gaming, Finance" style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: 14, color: 'var(--text-primary)', outline: 'none' }} />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input type="checkbox" checked={seoMode} onChange={e => setSeoMode(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--brand)' }} />
          <span style={{ fontSize: 14, color: 'var(--text-primary)' }}>Optimize for YouTube Search</span>
        </label>

        <button onClick={generate} disabled={loading || !topic.trim()} style={{ background: 'var(--brand)', color: 'white', border: 'none', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: 14, fontWeight: 600, cursor: loading || !topic.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading || !topic.trim() ? 0.7 : 1 }}>
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Hash size={18} />}
          Generate Tags
        </button>
      </div>

      <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        {result ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Broad Tags</h3>
                <button onClick={() => copyAll(result.broad)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Copy size={14} /> Copy All
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.broad.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)} style={{ background: selected.includes(tag) ? 'var(--brand-dim)' : 'var(--bg-surface)', border: `1px solid ${selected.includes(tag) ? 'var(--brand)' : 'var(--border-subtle)'}`, color: selected.includes(tag) ? 'var(--brand-light)' : 'var(--text-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Niche Tags</h3>
                <button onClick={() => copyAll(result.niche)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Copy size={14} /> Copy All
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.niche.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)} style={{ background: selected.includes(tag) ? 'var(--brand-dim)' : 'var(--bg-surface)', border: `1px solid ${selected.includes(tag) ? 'var(--brand)' : 'var(--border-subtle)'}`, color: selected.includes(tag) ? 'var(--brand-light)' : 'var(--text-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700 }}>Micro Tags</h3>
                <button onClick={() => copyAll(result.micro)} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Copy size={14} /> Copy All
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {result.micro.map(tag => (
                  <button key={tag} onClick={() => toggleTag(tag)} style={{ background: selected.includes(tag) ? 'var(--brand-dim)' : 'var(--bg-surface)', border: `1px solid ${selected.includes(tag) ? 'var(--brand)' : 'var(--border-subtle)'}`, color: selected.includes(tag) ? 'var(--brand-light)' : 'var(--text-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-full)', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Title Variants</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {result.titleVariants.map((v, i) => (
                  <div key={i} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{v.title}</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--teal)', background: 'var(--teal-dim)', padding: '4px 8px', borderRadius: 'var(--radius-full)' }}>Est. CTR: {v.estimatedCTR}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', flexDirection: 'column', gap: 16 }}>
            <Hash size={48} color="var(--border-strong)" />
            <p>Enter a topic and click Generate to get AI-optimized hashtags.</p>
          </div>
        )}
      </div>
    </div>
  )
}
