import { useState, useRef, useEffect } from 'react'
import AppShell from '../components/AppShell'
import Nav from '../components/Nav'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { Link, useNavigate } from 'react-router-dom'
import { apiChat, type ChatMessage } from '../lib/api'

interface Message { id: number; role: 'user' | 'assistant'; content: string; ts: Date }

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  const result: React.ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith('### ')) {
      result.push(<h4 key={i} style={{ fontSize: 13, fontWeight: 700, margin: '12px 0 4px', letterSpacing: '0.04em' }}>{line.slice(4)}</h4>)
    } else if (line.startsWith('## ')) {
      result.push(<h3 key={i} style={{ fontSize: 14, fontWeight: 700, margin: '14px 0 6px' }}>{line.slice(3)}</h3>)
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      result.push(
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <span style={{ color: 'var(--mid-gray)', flexShrink: 0 }}>·</span>
          <span style={{ fontSize: 14, lineHeight: 1.6 }}>{inlineMd(line.slice(2))}</span>
        </div>
      )
    } else if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)\./)?.[1]
      result.push(
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
          <span style={{ color: 'var(--mid-gray)', flexShrink: 0, minWidth: 16, textAlign: 'right' }}>{num}.</span>
          <span style={{ fontSize: 14, lineHeight: 1.6 }}>{inlineMd(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      )
    } else if (line === '') {
      result.push(<div key={i} style={{ height: 8 }} />)
    } else {
      result.push(<p key={i} style={{ fontSize: 14, lineHeight: 1.75, margin: 0 }}>{inlineMd(line)}</p>)
    }
    i++
  }
  return result
}

function inlineMd(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>
    if (p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>
    if (p.startsWith('`') && p.endsWith('`')) return <code key={i} style={{ fontFamily: 'monospace', fontSize: 12.5, background: 'var(--off-white)', padding: '1px 5px', border: '1px solid var(--border)' }}>{p.slice(1, -1)}</code>
    return p
  })
}

export default function Dashboard() {
  const { user, isAuthed, trialExpiresAt, isTrialExpired } = useAuth()
  const { tier } = useSubscription()
  const nav = useNavigate()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const historyRef = useRef<ChatMessage[]>([])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streaming])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  const send = async (text = input.trim()) => {
    if (!text || streaming) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setAiError(null)
    const userMsg: Message = { id: Date.now(), role: 'user', content: text, ts: new Date() }
    setMessages(prev => [...prev, userMsg])
    setStreaming(true)

    const history = historyRef.current.slice()
    historyRef.current.push({ role: 'user', parts: [{ text }] })

    try {
      const res = await apiChat(text, history, user?.id)
      const reply = res.content || 'Unable to generate a response. Please try again.'
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: reply, ts: new Date() }])
      historyRef.current.push({ role: 'model', parts: [{ text: reply }] })
    } catch {
      setAiError('Could not reach the service. Please check your connection and try again.')
      historyRef.current.pop()
    } finally {
      setStreaming(false)
    }
  }

  const handleAction = (type: 'camera' | 'video') => {
    if (tier === 'free') {
      nav('/pricing')
    } else {
      nav('/camera')
    }
  }

  const empty = messages.length === 0
  const daysLeft = trialExpiresAt ? Math.max(0, Math.ceil((new Date(trialExpiresAt).getTime() - Date.now()) / 86400000)) : null
  const hasBanner = isAuthed && tier === 'free' && daysLeft !== null

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: '#fdfbf7', overflow: 'hidden' }}>
      
      {/* Left Sidebar (Claude Style) */}
      <div style={{ width: 260, borderRight: '1px solid var(--border)', background: '#f5f4ef', display: 'flex', flexDirection: 'column', padding: '20px 16px', flexShrink: 0 }}>
        <Link to="/" style={{ fontFamily: 'var(--font-sans)', fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--black)', marginBottom: 24, paddingLeft: 8 }}>
          MedMed.AI
        </Link>
        
        <button onClick={() => { setMessages([]); historyRef.current = []; setInput(''); }} style={{ width: '100%', padding: '10px 14px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 5, textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--black)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: 16 }}>+</span> New Chat
        </button>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--mid-gray)', marginBottom: 12, paddingLeft: 8 }}>Recent Chats</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {!empty && (
              <div style={{ padding: '8px 12px', borderRadius: 5, background: 'var(--white)', fontSize: 13, color: 'var(--black)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', border: '1px solid var(--border)' }}>
                Current Conversation
              </div>
            )}
            <div style={{ padding: '8px 12px', borderRadius: 5, fontSize: 13, color: 'var(--dark-gray)', cursor: 'pointer' }}>Aspirin interactions</div>
            <div style={{ padding: '8px 12px', borderRadius: 5, fontSize: 13, color: 'var(--dark-gray)', cursor: 'pointer' }}>Tylenol dosage for kids</div>
          </div>

          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--mid-gray)', marginTop: 32, marginBottom: 12, paddingLeft: 8 }}>Your Files (Pro)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ padding: '8px 12px', borderRadius: 5, fontSize: 12, color: 'var(--dark-gray)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--mid-gray)' }}>📄</span> Lab_Results_May.pdf
            </div>
            <div style={{ padding: '8px 12px', borderRadius: 5, fontSize: 12, color: 'var(--dark-gray)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: 'var(--mid-gray)' }}>🖼️</span> Rash_Day_2.jpg
            </div>
          </div>
        </div>

        <div style={{ paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '0 8px', marginBottom: 20 }}>
            <Link to="/business" style={{ fontSize: 12, color: 'var(--dark-gray)', textDecoration: 'none', fontWeight: 500 }}>Business Center</Link>
            <Link to="/sponsors" style={{ fontSize: 12, color: 'var(--dark-gray)', textDecoration: 'none', fontWeight: 500 }}>Sponsors</Link>
            <Link to="/support" style={{ fontSize: 12, color: 'var(--dark-gray)', textDecoration: 'none', fontWeight: 500 }}>Support</Link>
          </div>
          <div style={{ padding: '8px', fontSize: 12, color: 'var(--dark-gray)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{user?.name || 'User Account'}</div>
              <div style={{ fontSize: 10, color: 'var(--mid-gray)', textTransform: 'uppercase' }}>{tier} Plan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {hasBanner && (
          <div style={{
            background: isTrialExpired ? '#7f1d1d' : daysLeft <= 1 ? '#92400e' : 'var(--black)',
            color: 'var(--white)', padding: '9px 28px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 11.5, letterSpacing: '0.04em', zIndex: 80,
          }}>
            <span>
              {isTrialExpired ? 'Your free trial has ended. Upgrade to keep access.' : `Free trial — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining.`}
            </span>
            <Link to="/pricing" style={{ color: 'var(--white)', textDecoration: 'underline', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>
              UPGRADE →
            </Link>
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 140 }}>
          {empty ? (
             <div style={{ maxWidth: 820, margin: '0 auto', paddingTop: '10vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
               <h1 style={{ fontSize: 28, fontWeight: 300, lineHeight: 1.15, letterSpacing: '-0.02em', color: 'var(--black)', marginBottom: 32 }}>
                 {isAuthed ? `Good to see you, ${user?.name?.split(' ')[0] || user?.email?.split('@')[0]}.` : `What can I help you understand?`}
               </h1>
             </div>
          ) : (
            <div style={{ maxWidth: 820, margin: '0 auto', padding: '36px 28px 24px' }}>
              {messages.map(m => (
                <div key={m.id} style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{m.role === 'user' ? (user?.name?.split(' ')[0] || 'You') : 'MedMed.AI'}</span>
                    <span style={{ fontSize: 10, color: 'var(--mid-gray)' }}>{m.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ maxWidth: '84%', padding: m.role === 'user' ? '12px 18px' : '0px', background: m.role === 'user' ? 'var(--white)' : 'transparent', color: 'var(--black)', border: m.role === 'user' ? '1px solid var(--border)' : 'none', fontSize: 15, lineHeight: 1.6, whiteSpace: m.role === 'user' ? 'pre-wrap' : undefined, borderRadius: 8 }}>
                    {m.role === 'user' ? m.content : renderMarkdown(m.content)}
                  </div>
                </div>
              ))}
              {streaming && (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>MedMed.AI</span>
                  </div>
                  <div style={{ padding: '8px 0', display: 'inline-flex', gap: 5, alignItems: 'center' }}>
                    {[0, 140, 280].map(d => (<span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mid-gray)', display: 'inline-block', animation: 'medmedDot 1.2s ease-in-out infinite', animationDelay: `${d}ms` }} />))}
                  </div>
                </div>
              )}
              {aiError && (<div style={{ padding: '12px 16px', border: '1px solid #fca5a5', background: '#fff5f5', borderRadius: 5, fontSize: 13, color: '#7f1d1d', marginBottom: 16 }}>{aiError}</div>)}
              <div ref={endRef} />
            </div>
          )}
        </div>

        {/* Input Bar (Starts Middle, Moves Bottom) */}
        <div style={{ 
          position: 'absolute', 
          bottom: empty ? 'calc(50% + 20px)' : 0, 
          left: 0, 
          right: 0, 
          transform: empty ? 'translateY(50%)' : 'none',
          padding: empty ? '20px 28px' : '16px 28px 24px', 
          background: empty ? 'transparent' : 'linear-gradient(to top, #fdfbf7 80%, transparent)', 
          pointerEvents: 'none',
          transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}>
          <div style={{ maxWidth: 820, margin: '0 auto', pointerEvents: 'auto' }}>
            
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              background: 'var(--white)',
              borderRadius: 12,
              padding: '12px 16px',
              border: '1px solid var(--border)',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--mid-gray)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
            }}>
              <textarea ref={textareaRef} value={input} onChange={handleInputChange} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder="Message MedMed.AI..." rows={2} style={{ flex: 1, resize: 'none', border: 'none', background: 'transparent', padding: '4px 2px', fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 400, color: 'var(--black)', outline: 'none', lineHeight: 1.55, maxHeight: 300, overflowY: 'auto' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {/* Camera Analysis Button */}
                  <button onClick={() => handleAction('camera')} title="Take Picture / Analyze" style={{ background: 'transparent', border: 'none', borderRadius: 5, cursor: 'pointer', color: 'var(--mid-gray)', padding: '6px', display: 'flex', alignItems: 'center', transition: 'all 0.1s' }} onMouseEnter={e => e.currentTarget.style.color='var(--black)'} onMouseLeave={e => e.currentTarget.style.color='var(--mid-gray)'}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                  </button>
                  {/* Video Scan Button */}
                  <button onClick={() => handleAction('video')} title="Video Body Scan" style={{ background: 'transparent', border: 'none', borderRadius: 5, cursor: 'pointer', color: 'var(--mid-gray)', padding: '6px', display: 'flex', alignItems: 'center', transition: 'all 0.1s' }} onMouseEnter={e => e.currentTarget.style.color='var(--black)'} onMouseLeave={e => e.currentTarget.style.color='var(--mid-gray)'}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
                  </button>
                </div>
                
                <button onClick={() => send()} disabled={!input.trim() || streaming} style={{ padding: '8px 14px', background: input.trim() && !streaming ? 'var(--black)' : '#e5e5e4', color: input.trim() && !streaming ? 'var(--white)' : 'var(--mid-gray)', fontSize: 13, fontWeight: 600, letterSpacing: '0.04em', borderRadius: 8, border: 'none', cursor: input.trim() && !streaming ? 'pointer' : 'not-allowed', transition: 'all 0.1s' }}>{streaming ? '...' : 'Send'}</button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--mid-gray)' }}>MedMed.AI can make mistakes. Verify important information with your physician.</div>
            </div>
          </div>
        </div>

      </div>
      <style>{`@keyframes medmedDot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }`}</style>
    </div>
  )
}
