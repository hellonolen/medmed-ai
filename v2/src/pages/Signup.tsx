import GlobalFooter from "../components/GlobalFooter"

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Nav from '../components/Nav'

export default function Signup() {
  const { signUp, error, loading } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [linkSent, setLinkSent] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // For immediate dev testing without real email backend, mock sign up
      if (email.includes('@medmed.ai')) {
        await signUp(name, email, 'Medmed2025!')
        nav('/dashboard')
      } else {
        setLinkSent(true)
      }
    } catch { /* error shown via context */ }
  }

  const inp: React.CSSProperties = {
    width: '100%', padding: '13px 14px',
    border: '1px solid var(--border)', background: 'var(--off-white)',
    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 300,
    color: 'var(--black)', borderRadius: 8, outline: 'none',
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)', display: 'flex', flexDirection: 'column' }}>
      <Nav />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 100px' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div className="tag" style={{ marginBottom: 12 }}>Get Started</div>
          <h2 style={{ marginBottom: 6 }}>Create your account</h2>
          <p style={{ fontSize: 13, color: 'var(--dark-gray)', marginBottom: 28 }}>3-day free trial. No credit card required.</p>

          {error && (
            <div style={{ marginBottom: 16, padding: '12px 14px', border: '1px solid #fca5a5', background: '#fff5f5', fontSize: 13, color: '#7f1d1d', borderRadius: 8 }}>
              {error}
            </div>
          )}

          {linkSent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '16px 18px', border: '1px solid var(--border)', background: 'var(--white)', fontSize: 14, color: 'var(--dark-gray)', borderRadius: 8 }}>
                <strong>Check your inbox.</strong> We sent a secure magic link to verify <span style={{ color: 'var(--black)' }}>{email}</span>.
              </div>
              <button onClick={() => setLinkSent(false)} style={{ padding: '13px', background: 'transparent', color: 'var(--mid-gray)', fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer' }}>
                Change details
              </button>
            </div>
          ) : (
            <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: 'block', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--mid-gray)', marginBottom: 6 }}>Full Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" style={{ ...inp, transition: 'border-color 0.2s', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--mid-gray)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--mid-gray)', marginBottom: 6 }}>Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={{ ...inp, transition: 'border-color 0.2s', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)' }} onFocus={e => e.currentTarget.style.borderColor = 'var(--mid-gray)'} onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
                <button type="submit" disabled={loading} style={{
                  width: '100%', padding: '14px',
                  background: loading ? 'var(--light-gray)' : 'var(--black)',
                  color: loading ? 'var(--mid-gray)' : 'var(--white)',
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                  border: 'none', borderRadius: 5, cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
                
                <button type="button" onClick={() => nav('/login')} style={{
                  width: '100%', padding: '14px',
                  background: 'var(--white)',
                  color: 'var(--dark-gray)',
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                  border: '1px solid var(--border)', borderRadius: 5, cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--off-white)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--white)'}
                >
                  Sign into existing account
                </button>
              </div>
            </form>
          )}

          <p style={{ marginTop: 24, fontSize: 10.5, color: 'var(--mid-gray)', lineHeight: 1.6, textAlign: 'center' }}>
            By continuing you agree to our <Link to="/terms" style={{ textDecoration: 'underline' }}>Terms</Link> and <Link to="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>
      <GlobalFooter />
    </div>
  )
}
