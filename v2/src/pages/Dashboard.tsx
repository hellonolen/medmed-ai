import { useState, useRef, useEffect } from 'react'
import AppShell from '../components/AppShell'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { useAuth } from '../contexts/AuthContext'
import { useSubscription } from '../contexts/SubscriptionContext'
import { Link } from 'react-router-dom'
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

const SUGGESTED = [
  { q: 'What causes frequent headaches?', icon: '◉' },
  { q: 'Is ibuprofen safe with blood thinners?', icon: '⬡' },
  { q: 'Find a 24hr pharmacy nearby', icon: '▤' },
  { q: 'Explain Type 2 diabetes risk factors', icon: '◈' },
  { q: 'What are factors of low iron?', icon: '◉' },
  { q: 'Compare Ozempic vs Wegovy', icon: '⬡' },
]

const QUICK_TOOLS = [
  { icon: '◉', label: 'Symptoms', path: '/symptom-checker' },
  { icon: '⬡', label: 'Interactions', path: '/interactions' },
  { icon: '▤', label: 'Finder', path: '/pharmacy' },
  { icon: '⊙', label: 'Visualization', path: '/camera' },
]

export default function Dashboard() {
  const { user, isAuthed, trialExpiresAt, isTrialExpired } = useAuth()
  const { tier } = useSubscription()
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

  const empty = messages.length === 0
  const daysLeft = trialExpiresAt ? Math.max(0, Math.ceil((new Date(trialExpiresAt).getTime() - Date.now()) / 86400000)) : null
  const hasBanner = isAuthed && tier === 'free' && daysLeft !== null

  return (
    <AppShell>
      {hasBanner && (
        <div style={{
          background: isTrialExpired ? '#7f1d1d' : daysLeft <= 1 ? '#92400e' : 'var(--black)',
          color: 'var(--white)', padding: '9px 28px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 11.5, letterSpacing: '0.04em',
          position: 'fixed', top: 56, left: 220, right: 0, zIndex: 80,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}>
          <span>
            {isTrialExpired ? 'Your free trial has ended. Upgrade to keep access.' : `Free trial — ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining.`}
          </span>
          <Link to="/pricing" style={{ color: 'var(--white)', textDecoration: 'underline', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em' }}>
            UPGRADE →
          </Link>
        </div>
      )}

      <div style={{
        display: 'flex', flexDirection: 'column',
        height: 'calc(100vh - 56px)',
        paddingTop: hasBanner ? 36 : 0,
        background: 'var(--off-white)',
      }}>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {empty ? (
            <div style={{ maxWidth: 680, margin: '0 auto', padding: '52px 28px 20px' }}>
              <div style={{ marginBottom: 40 }}>
                <div className="tag" style={{ marginBottom: 12 }}>Research Dashboard</div>
                <h1 style={{ fontSize: 36, fontWeight: 300, lineHeight: 1.15, marginBottom: 14, letterSpacing: '-0.02em' }}>
                  {isAuthed ? <>Good to have you back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.<br />What are we looking into today?</> : <>What can I help<br />you understand?</>}
                </h1>
                <p style={{ fontSize: 15, color: 'var(--dark-gray)', lineHeight: 1.7, maxWidth: 500 }}>
                  Ask any health question — medications, symptoms, conditions, interactions. I will give you clear, organized information — never a diagnosis.
                </p>
              </div>
              <div style={{ marginBottom: 40 }}>
                <div className="tag" style={{ marginBottom: 12 }}>Suggested</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {SUGGESTED.map(s => (
                    <button key={s.q} onClick={() => send(s.q)} style={{ padding: '14px 16px', textAlign: 'left', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 13.5, color: 'var(--dark-gray)', lineHeight: 1.4, cursor: 'pointer', transition: 'all 0.1s', display: 'flex', gap: 10, alignItems: 'flex-start' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--black)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <span style={{ color: 'var(--mid-gray)', flexShrink: 0, fontSize: 12 }}>{s.icon}</span>
                      {s.q}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 28 }}>
                <div className="tag" style={{ marginBottom: 12 }}>Specialized Tools</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {QUICK_TOOLS.map(t => (
                    <Link key={t.path} to={t.path} style={{ padding: '9px 16px', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 12.5, color: 'var(--dark-gray)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.1s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--black)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                      <span style={{ fontSize: 13 }}>{t.icon}</span>
                      {t.label}
                    </Link>
                  ))}
                </div>
              </div>
              {!isAuthed && (
                <div style={{ padding: '14px 16px', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 13, color: 'var(--dark-gray)', lineHeight: 1.6 }}>
                  <Link to="/signup" style={{ fontWeight: 600, textDecoration: 'underline' }}>Create a free account</Link> to save your conversation history and unlock personalized responses.
                </div>
              )}
            </div>
          ) : (
            <div style={{ maxWidth: 720, margin: '0 auto', padding: '36px 28px 24px' }}>
              {messages.map(m => (
                <div key={m.id} style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    {m.role === 'assistant' && (<div style={{ width: 22, height: 22, background: 'var(--black)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>M</div>)}
                    <span className="tag">{m.role === 'user' ? (user?.name?.split(' ')[0] || 'You') : 'medmed.ai'}</span>
                    <span style={{ fontSize: 9, color: 'var(--mid-gray)' }}>{m.ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div style={{ maxWidth: '84%', padding: m.role === 'user' ? '12px 18px' : '18px 22px', background: m.role === 'user' ? 'var(--black)' : 'var(--white)', color: m.role === 'user' ? 'var(--white)' : 'var(--black)', border: m.role === 'assistant' ? '1px solid var(--border)' : 'none', fontSize: 14, lineHeight: 1.7, whiteSpace: m.role === 'user' ? 'pre-wrap' : undefined }}>
                    {m.role === 'user' ? m.content : renderMarkdown(m.content)}
                  </div>
                </div>
              ))}
              {streaming && (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 22, height: 22, background: 'var(--black)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>M</div>
                    <span className="tag">medmed.ai</span>
                  </div>
                  <div style={{ padding: '16px 22px', border: '1px solid var(--border)', background: 'var(--white)', display: 'inline-flex', gap: 5, alignItems: 'center' }}>
                    {[0, 140, 280].map(d => (<span key={d} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mid-gray)', display: 'inline-block', animation: 'medmedDot 1.2s ease-in-out infinite', animationDelay: `${d}ms` }} />))}
                  </div>
                </div>
              )}
              {aiError && (<div style={{ padding: '12px 16px', border: '1px solid #fca5a5', background: '#fff5f5', fontSize: 13, color: '#7f1d1d', marginBottom: 16 }}>{aiError}</div>)}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', background: 'var(--white)', padding: '16px 28px 18px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {QUICK_TOOLS.map(t => (
                <Link key={t.path} to={t.path} title={t.label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', border: '1px solid var(--border)', background: 'var(--off-white)', textDecoration: 'none', fontSize: 11, color: 'var(--dark-gray)', fontWeight: 500, transition: 'all 0.1s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--black)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                  <span style={{ fontSize: 12 }}>{t.icon}</span>
                  <span>{t.label.split(' ')[0]}</span>
                </Link>
              ))}
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                {!empty && (
                  <button onClick={() => { setMessages([]); historyRef.current = [] }} style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid-gray)', cursor: 'pointer', background: 'none', border: 'none', padding: '4px 8px' }}>Clear</button>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', border: '1px solid var(--border)', background: 'var(--off-white)', padding: '2px 2px 2px 14px' }}>
              <textarea ref={textareaRef} value={input} onChange={handleInputChange} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder="Ask any question… (Shift+Enter for new line)" rows={1} style={{ flex: 1, resize: 'none', border: 'none', background: 'transparent', padding: '11px 0', fontFamily: 'var(--font-sans)', fontSize: 14.5, fontWeight: 300, color: 'var(--black)', outline: 'none', lineHeight: 1.55, maxHeight: 200, overflowY: 'auto' }} />
              <button onClick={() => send()} disabled={!input.trim() || streaming} style={{ padding: '10px 20px', alignSelf: 'flex-end', margin: '2px', background: input.trim() && !streaming ? 'var(--black)' : 'var(--light-gray)', color: input.trim() && !streaming ? 'var(--white)' : 'var(--mid-gray)', fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', border: 'none', cursor: input.trim() && !streaming ? 'pointer' : 'not-allowed', flexShrink: 0, lineHeight: '22px', transition: 'all 0.12s' }}>{streaming ? '···' : 'Send'}</button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <div style={{ fontSize: 10, color: 'var(--mid-gray)', letterSpacing: '0.04em' }}>For informational purposes only · Not a substitute for professional advice</div>
              <div style={{ fontSize: 10, color: 'var(--mid-gray)' }}>↵ send · ⇧↵ new line</div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
      <style>{`@keyframes medmedDot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; } 40% { transform: scale(1); opacity: 1; } }`}</style>
    </AppShell>
  )
}
