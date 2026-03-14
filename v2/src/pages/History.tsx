import { useState, useEffect } from 'react'
import AppShell from '../components/AppShell'
import { apiGetSessions, type Session } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'

function groupByDate(sessions: Session[]): Record<string, Session[]> {
  const now = new Date()
  const groups: Record<string, Session[]> = {}
  for (const s of sessions) {
    const d = new Date(s.created_at)
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
    const group = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : diffDays < 7 ? 'This week' : diffDays < 30 ? 'This month' : 'Older'
    if (!groups[group]) groups[group] = []
    groups[group].push(s)
  }
  return groups
}

const TOOL_COLORS: Record<string, string> = {
  Chat: '#1D1D1D', 'Symptom Checker': '#059669', 'Drug Interactions': '#d97706',
  'Pharmacy Finder': '#2563eb', 'Camera': '#7c3aed',
}

export default function History() {
  const { isAuthed, user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!isAuthed) { setLoading(false); return }
    apiGetSessions()
      .then(setSessions)
      .catch(() => setError('Could not load history.'))
      .finally(() => setLoading(false))
  }, [isAuthed])

  const filtered = sessions.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.preview?.toLowerCase().includes(search.toLowerCase())
  )
  const grouped = groupByDate(filtered)
  const GROUP_ORDER = ['Today', 'Yesterday', 'This week', 'This month', 'Older']

  return (
    <AppShell>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <div className="tag" style={{ marginBottom: 8 }}>History</div>
            <h1>Conversations</h1>
          </div>
          {sessions.length > 0 && (
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search history…"
              style={{ padding: '8px 12px', border: '1px solid var(--border)', background: 'var(--off-white)', fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 300, color: 'var(--black)', outline: 'none', borderRadius: 0, width: 200 }}
            />
          )}
        </div>

        {!isAuthed && (
          <div style={{ padding: '32px', border: '1px solid var(--border)', background: 'var(--white)', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 16 }}>Sign in to view your conversation history.</p>
            <Link to="/login" style={{ padding: '10px 24px', background: 'var(--black)', color: 'var(--white)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'inline-block' }}>Sign In</Link>
          </div>
        )}

        {isAuthed && loading && (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--mid-gray)', fontSize: 13 }}>Loading…</div>
        )}

        {isAuthed && error && (
          <div style={{ padding: '14px 16px', border: '1px solid #fca5a5', background: '#fff5f5', fontSize: 13, color: '#7f1d1d' }}>{error}</div>
        )}

        {isAuthed && !loading && sessions.length === 0 && !error && (
          <div style={{ padding: '48px 32px', border: '1px solid var(--border)', background: 'var(--white)', textAlign: 'center' }}>
            <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 20 }}>No conversations yet, {user?.name?.split(' ')[0] || 'there'}.</p>
            <Link to="/dashboard" style={{ padding: '10px 24px', background: 'var(--black)', color: 'var(--white)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', display: 'inline-block' }}>Start a Conversation</Link>
          </div>
        )}

        {isAuthed && !loading && filtered.length > 0 && GROUP_ORDER.map(group => {
          const items = grouped[group]
          if (!items?.length) return null
          return (
            <div key={group} style={{ marginBottom: 36 }}>
              <div className="tag" style={{ marginBottom: 12, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>{group}</div>
              {items.map(s => (
                <Link key={s.id} to={`/dashboard`} state={{ sessionId: s.id }} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '16px 0', borderBottom: '1px solid var(--border)',
                  textDecoration: 'none', color: 'inherit',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--off-white)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                  <div style={{ flex: 1, paddingRight: 16 }}>
                    <div style={{ fontWeight: 500, fontSize: 14.5, marginBottom: 4 }}>{s.title}</div>
                    {s.preview && <div style={{ fontSize: 12.5, color: 'var(--mid-gray)', lineHeight: 1.5 }}>{s.preview.slice(0, 100)}{s.preview.length > 100 ? '…' : ''}</div>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="tag" style={{ marginBottom: 4, color: TOOL_COLORS[s.tool] || 'var(--mid-gray)' }}>{s.tool}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--mid-gray)' }}>{new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                </Link>
              ))}
            </div>
          )
        })}

        {isAuthed && !loading && sessions.length > 0 && filtered.length === 0 && (
          <p style={{ fontSize: 13, color: 'var(--mid-gray)', textAlign: 'center', padding: '40px 0' }}>No conversations match "{search}"</p>
        )}
      </div>
    </AppShell>
  )
}
