import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { signIn, error, loading } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn(email, pw)
      nav('/dashboard')
    } catch { /* error shown via context */ }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '11px 12px',
    border: '1px solid var(--border)', background: 'var(--off-white)',
    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 300,
    color: 'var(--black)', borderRadius: 0, outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 40px', borderBottom: '1px solid var(--border)', background: 'var(--white)' }}>
        <Link to="/" style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 18, fontWeight: 300 }}>medmed.ai</Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div className="tag" style={{ marginBottom: 12 }}>Sign in</div>
          <h2 style={{ marginBottom: 28 }}>Welcome back</h2>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', border: '1px solid #fca5a5', background: '#fff5f5', fontSize: 13, color: '#7f1d1d' }}>
              {error}
            </div>
          )}

          {resetSent && (
            <div style={{ marginBottom: 16, padding: '10px 14px', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 13, color: 'var(--dark-gray)' }}>
              Password reset email sent. Check your inbox.
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--mid-gray)', marginBottom: 6 }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--mid-gray)', marginBottom: 6 }}>Password</label>
              <input type="password" required value={pw} onChange={e => setPw(e.target.value)} placeholder="••••••••" style={inp} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? 'var(--light-gray)' : 'var(--black)',
              color: loading ? 'var(--mid-gray)' : 'var(--white)',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 6,
            }}>{loading ? 'Signing in…' : 'Sign In'}</button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--mid-gray)' }}>
            <Link to="/signup" style={{ textDecoration: 'underline' }}>Create an account</Link>
            <button onClick={async () => {
              if (!email) { alert('Enter your email first.'); return }
              const { apiRequestReset } = await import('../lib/api')
              await apiRequestReset(email)
              setResetSent(true)
            }} style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: 12, color: 'var(--mid-gray)' }}>
              Forgot password?
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
