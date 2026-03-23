import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAIChat } from '../../hooks/useAIChat'
import { BrainCircuit, SendHorizontal, ChevronRight } from 'lucide-react'

const QUICK_PROMPTS = [
  "Why did my last video underperform?",
  "What should I post this week?",
  "When is my best time to post?",
  "How close am I to monetization?",
]

export default function AICopilot() {
  const [input, setInput] = useState('')
  const [collapsed, setCollapsed] = useState(false)
  const [showQuick, setShowQuick] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, sendMessage, isStreaming } = useAIChat()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim()) return
    setShowQuick(false)
    await sendMessage(input)
    setInput('')
  }

  if (collapsed) {
    return (
      <div style={{ width:48, background:'var(--bg-surface)', borderLeft:'0.5px solid var(--border-subtle)', display:'flex', flexDirection:'column', alignItems:'center', padding:'16px 0' }}>
        <button onClick={() => setCollapsed(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--brand-light)' }}>
          <BrainCircuit size={20} />
        </button>
      </div>
    )
  }

  return (
    <div style={{ width:300, background:'var(--bg-surface)', borderLeft:'0.5px solid var(--border-subtle)', display:'flex', flexDirection:'column', height:'100vh', position:'sticky', top:0 }}>

      {/* Header */}
      <div style={{ padding:'16px 16px 12px', borderBottom:'0.5px solid var(--border-subtle)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:2 }}>
            <BrainCircuit size={16} color="var(--brand-light)" />
            <span style={{ fontFamily:'var(--font-display)', fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>AI Co-pilot</span>
          </div>
          <div style={{ fontSize:11, color:'var(--text-tertiary)' }}>Has access to your channel data</div>
        </div>
        <button onClick={() => setCollapsed(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-tertiary)' }}>
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:'auto', padding:'12px 12px 0', display:'flex', flexDirection:'column', gap:10 }}>
        {messages.length === 0 && (
          <div style={{ color:'var(--text-secondary)', fontSize:13, padding:'8px 0' }}>
            Ask me anything about your YouTube channel.
          </div>
        )}

        {messages.map(msg => (
          <div key={msg.id} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            background: msg.role === 'user' ? 'var(--brand-dim)' : 'var(--bg-elevated)',
            border: `1px solid ${msg.role === 'user' ? 'var(--brand-border)' : 'var(--border-subtle)'}`,
            borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
            padding: '10px 14px',
            maxWidth: '88%',
            fontSize: 13,
            color: msg.role === 'user' ? 'var(--text-primary)' : '#c0bcdc',
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap',
          }}>
            {msg.content}
            {/* Show blinking cursor on last AI message while streaming */}
            {isStreaming && msg.role === 'assistant' && msg === messages[messages.length-1] && (
              <span style={{ display:'inline-block', width:2, height:14, background:'var(--brand-light)', marginLeft:2, verticalAlign:'middle', animation:'blink 1s step-end infinite' }} />
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <AnimatePresence>
        {showQuick && messages.length === 0 && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} style={{ padding:'12px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {QUICK_PROMPTS.map(prompt => (
              <button key={prompt} onClick={() => { setShowQuick(false); sendMessage(prompt) }}
                style={{ background:'var(--bg-elevated)', border:'1px solid var(--border-subtle)', borderRadius:'var(--radius-full)', padding:'6px 10px', fontSize:11, color:'var(--text-secondary)', cursor:'pointer', textAlign:'left', lineHeight:1.4 }}>
                {prompt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div style={{ padding:'12px', borderTop:'0.5px solid var(--border-subtle)', position:'relative' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Ask about your channel..."
          rows={2}
          style={{
            width:'100%', background:'var(--bg-input)', border:'1px solid var(--border-default)', borderRadius:'var(--radius-lg)',
            padding:'10px 42px 10px 14px', fontSize:13, color:'var(--text-primary)', resize:'none', fontFamily:'var(--font-body)',
            outline:'none',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming}
          style={{
            position:'absolute', right:22, bottom:22, width:32, height:32, borderRadius:'50%',
            background: input.trim() ? 'var(--brand)' : 'var(--bg-elevated)',
            border:'none', cursor: input.trim() ? 'pointer' : 'default',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}
        >
          <SendHorizontal size={14} color="white" />
        </button>
      </div>

      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  )
}
