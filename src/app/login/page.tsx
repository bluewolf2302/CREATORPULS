import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/auth'
import { useGoalStore } from '../../store/goalMode'
import { motion } from 'framer-motion'
import { Play, TrendingUp, Users, DollarSign, Loader2, Link as LinkIcon, ArrowRight } from 'lucide-react'
import { auth, googleProvider, db } from '../../firebase'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

export default function LoginPage() {
  const { accessToken, setAccessToken, guestChannelId, setGuestChannelId } = useAuthStore()
  const { goalMode } = useGoalStore()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const [channelUrl, setChannelUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (accessToken || guestChannelId) {
      navigate(goalMode ? '/dashboard' : '/setup/goal')
    }
  }, [accessToken, guestChannelId, goalMode, navigate])

  const login = async () => {
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const token = credential?.accessToken
      
      if (token) {
        setAccessToken(token)
        
        // Save user to Firestore
        const userRef = doc(db, 'users', result.user.uid)
        const userSnap = await getDoc(userRef)
        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
            role: 'user',
            createdAt: new Date().toISOString()
          })
        }
      }
    } catch (error) {
      console.error("Error signing in with Google", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!channelUrl.trim()) return
    
    setGuestLoading(true)
    setErrorMsg('')
    
    try {
      let handle = ''
      let id = ''
      
      const input = channelUrl.trim()
      if (input.startsWith('@')) {
        handle = input
      } else {
        try {
          const parsed = new URL(input)
          if (parsed.pathname.startsWith('/@')) {
            handle = parsed.pathname.substring(1)
          } else if (parsed.pathname.startsWith('/channel/')) {
            id = parsed.pathname.split('/')[2]
          } else if (parsed.pathname.startsWith('/c/')) {
            handle = parsed.pathname.split('/')[2]
          } else {
            throw new Error('Invalid URL format')
          }
        } catch (e) {
          setErrorMsg('Please enter a valid YouTube URL or @handle')
          setGuestLoading(false)
          return
        }
      }

      const query = handle ? `handle=${encodeURIComponent(handle)}` : `id=${encodeURIComponent(id)}`
      const res = await fetch(`/api/youtube/channel?${query}`)
      
      if (!res.ok) {
        throw new Error('Channel not found')
      }
      
      const data = await res.json()
      setGuestChannelId(data.id)
      
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not find channel')
    } finally {
      setGuestLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Left Column */}
      <div style={{ flex: 1, padding: '64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: 'var(--brand-glow)', filter: 'blur(100px)', borderRadius: '50%' }} />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
            <div style={{ width: 48, height: 48, background: 'var(--brand)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: 20 }}>
              CP
            </div>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700 }}>CreatorPulse</span>
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 64, fontWeight: 800, lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
            Your YouTube Channel,<br />
            <span style={{ color: 'var(--brand-light)' }}>Decoded.</span>
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: 480, lineHeight: 1.6, marginBottom: 48 }}>
            Connect your channel to get AI-powered insights, growth strategies, and real-time performance tracking.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[
              { icon: TrendingUp, title: 'Growth Analytics', desc: 'Understand exactly what drives your views.' },
              { icon: Users, title: 'Audience Insights', desc: 'Know who is watching and when they are active.' },
              { icon: DollarSign, title: 'Monetization Tools', desc: 'Optimize your content for maximum revenue.' }
            ].map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.1 }} style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ width: 40, height: 40, background: 'var(--bg-elevated)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-light)' }}>
                  <feature.icon size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{feature.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Column */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-subtle)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} style={{
          background: 'var(--bg-elevated)', padding: '48px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-subtle)', width: '100%', maxWidth: 440, textAlign: 'center'
        }}>
          <div style={{ width: 64, height: 64, background: 'var(--coral-dim)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <Play size={32} color="var(--coral)" fill="var(--coral)" />
          </div>
          
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Sign in with your YouTube account to continue.</p>

          <button onClick={login} disabled={loading} style={{
            width: '100%', padding: '16px', background: 'white', color: '#000', borderRadius: 'var(--radius-lg)',
            border: 'none', fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', opacity: loading ? 0.7 : 1
          }} onMouseOver={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={e => { if (!loading) e.currentTarget.style.transform = 'translateY(0)' }}>
            {loading ? <Loader2 className="animate-spin" size={24} /> : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', margin: '32px 0', gap: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Or analyze any channel</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
          </div>

          <form onSubmit={handleGuestLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ position: 'relative' }}>
              <LinkIcon size={18} color="var(--text-secondary)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Paste YouTube URL or @handle" 
                value={channelUrl}
                onChange={e => setChannelUrl(e.target.value)}
                style={{
                  width: '100%', padding: '16px 16px 16px 48px', background: 'var(--bg-input)', border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-lg)', fontSize: 15, color: 'var(--text-primary)', outline: 'none', transition: 'border-color 0.2s'
                }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--brand)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
              />
            </div>
            {errorMsg && <div style={{ color: 'var(--coral)', fontSize: 13, textAlign: 'left', paddingLeft: 4 }}>{errorMsg}</div>}
            
            <button type="submit" disabled={guestLoading || !channelUrl.trim()} style={{
              width: '100%', padding: '16px', background: 'var(--brand)', color: 'white', borderRadius: 'var(--radius-lg)',
              border: 'none', fontSize: 16, fontWeight: 600, cursor: (guestLoading || !channelUrl.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.2s', opacity: (guestLoading || !channelUrl.trim()) ? 0.7 : 1
            }}>
              {guestLoading ? <Loader2 className="animate-spin" size={20} /> : (
                <>Analyze Channel <ArrowRight size={18} /></>
              )}
            </button>
          </form>
          
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 32 }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
