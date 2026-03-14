import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Signup() {
  const { signUp, error, loading } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [referral, setReferral] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pw.length < 8) return
    try {
      await signUp(name, email, pw)
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
          <div className="tag" style={{ marginBottom: 12 }}>Get started</div>
          <h2 style={{ marginBottom: 6 }}>Create your account</h2>
          <p style={{ fontSize: 13, color: 'var(--dark-gray)', marginBottom: 28 }}>3-day free trial. No credit card required.</p>

          {error && (
            <div style={{ marginBottom: 16, padding: '10px 14px', border: '1px solid #fca5a5', background: '#fff5f5', fontSize: 13, color: '#7f1d1d' }}>
              {error}
            </div>
          )}

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--mid-gray)', marginBottom: 6 }}>Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--mid-gray)', marginBottom: 6 }}>Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--mid-gray)', marginBottom: 6 }}>Password <span style={{ fontSize: 9, fontWeight: 400 }}>(min. 8 characters)</span></label>
              <input type="password" required minLength={8} value={pw} onChange={e => setPw(e.target.value)} placeholder="Choose a password" style={inp} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--mid-gray)', marginBottom: 6 }}>Referral Code <span style={{ fontWeight: 400 }}>(optional)</span></label>
              <input type="text" value={referral} onChange={e => setReferral(e.target.value)} placeholder="e.g. john-a1b2" style={inp} />
            </div>
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? 'var(--light-gray)' : 'var(--black)',
              color: loading ? 'var(--mid-gray)' : 'var(--white)',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: 6,
            }}>{loading ? 'Creating account…' : 'Create Account'}</button>
          </form>

          <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--border)', fontSize: 12, color: 'var(--mid-gray)' }}>
            Already have an account? <Link to="/login" style={{ textDecoration: 'underline' }}>Sign in</Link>
          </div>
          <p style={{ marginTop: 12, fontSize: 10.5, color: 'var(--mid-gray)', lineHeight: 1.6 }}>
            By creating an account you agree to our <Link to="/terms" style={{ textDecoration: 'underline' }}>Terms</Link> and <Link to="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
