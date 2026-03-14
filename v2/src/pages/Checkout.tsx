import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Nav from '../components/Nav'

const PLANS: Record<string, { name: string; price: number | null; perSeat?: number; minSeats?: number; sub: string; features: string[] }> = {
  free:       { name: 'Free',       price: null, sub: '3-day full access trial', features: ['Symptom Checker', 'Pharmacy Finder', 'Drug Interactions', 'Web chat'] },
  pro:        { name: 'Pro',        price: 20,   sub: 'per month · 1 user',     features: ['Unlimited questions', 'Live camera', '45-sec video', 'History', 'Documents', 'Priority'] },
  max:        { name: 'Max',        price: 100,  sub: 'per month · 1 user',     features: ['Everything in Pro', '5× usage', 'Higher limits', 'Early access'] },
  team:       { name: 'Team',       price: null, perSeat: 25, minSeats: 5, sub: 'per seat / month', features: ['Everything in Pro', 'Central billing', 'Admin controls', 'Usage dashboard'] },
  enterprise: { name: 'Enterprise', price: null, perSeat: 35, minSeats: 5, sub: 'per seat / month', features: ['Everything in Team', 'Role-based access', 'Audit logs', 'SLA guarantee'] },
}

export default function Checkout() {
  const [params] = useSearchParams()
  const initialPlan = params.get('plan') || 'pro'
  const initialSeats = parseInt(params.get('seats') || '5', 10)

  const [selectedPlan, setSelectedPlan] = useState(initialPlan)
  const [seats, setSeats] = useState(initialSeats)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [showModal, setShowModal] = useState(false)

  const plan = PLANS[selectedPlan] || PLANS.pro
  const isTeam = !!plan.perSeat
  const total = isTeam ? seats * plan.perSeat! : plan.price
  const priceStr = total ? `$${total.toLocaleString()}` : 'Free'

  useEffect(() => {
    if (plan.minSeats) setSeats(s => Math.max(plan.minSeats!, s))
  }, [selectedPlan])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowModal(false) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [])

  const submit = (e: React.FormEvent) => { e.preventDefault(); setShowModal(true) }

  const inputSt: React.CSSProperties = {
    width: '100%', padding: '10px 12px',
    border: '1px solid var(--border)', background: 'var(--off-white)',
    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 300,
    color: 'var(--black)', borderRadius: 0, outline: 'none',
  }

  return (
    <div className="page">
      <Nav />

      {/* Page header */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 40px 28px', borderBottom: '1px solid var(--border)' }}>
        <div className="tag" style={{ marginBottom: 10 }}>Checkout</div>
        <h1>Get started with<br />medmed</h1>
      </div>

      {/* Plan selector */}
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', borderBottom: '1px solid var(--border)' }}>
        {Object.entries(PLANS).map(([key, p]) => (
          <button key={key} onClick={() => setSelectedPlan(key)} style={{
            flex: 1, padding: '16px 8px', textAlign: 'center',
            borderRight: '1px solid var(--border)',
            borderBottom: selectedPlan === key ? '2px solid var(--black)' : '2px solid transparent',
            background: selectedPlan === key ? 'var(--white)' : 'transparent',
            color: selectedPlan === key ? 'var(--black)' : 'var(--mid-gray)',
            marginBottom: -1,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{p.name}</div>
            <div style={{ fontSize: 12, fontWeight: 300, marginTop: 2, color: 'inherit' }}>
              {p.price !== null ? `$${p.price}` : p.perSeat ? `$${p.perSeat}/seat` : 'Free'}
            </div>
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="checkout-layout">

        {/* Left — summary */}
        <div>
          <div className="tag" style={{ marginBottom: 16 }}>Order summary</div>
          <div className="checkout-panel">
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--mid-gray)', marginBottom: 6 }}>Plan</div>
            <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 28, fontWeight: 300 }}>{plan.name}</div>
            <div style={{ fontSize: 11, color: 'var(--mid-gray)', marginBottom: 20 }}>{plan.sub}</div>

            {/* Seat counter */}
            {isTeam && (
              <div style={{ border: '1px solid var(--border)', padding: 14, marginBottom: 20, background: 'var(--off-white)' }}>
                <div className="tag" style={{ marginBottom: 8 }}>Seats</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <button onClick={() => setSeats(s => Math.max(plan.minSeats!, s - 1))}
                    style={{ width: 28, height: 28, border: '1px solid var(--border)', background: 'var(--white)', fontSize: 16, borderRadius: 0, cursor: 'pointer' }}>−</button>
                  <span style={{ fontWeight: 700, fontSize: 18, minWidth: 24, textAlign: 'center' }}>{seats}</span>
                  <button onClick={() => setSeats(s => s + 1)}
                    style={{ width: 28, height: 28, border: '1px solid var(--border)', background: 'var(--white)', fontSize: 16, borderRadius: 0, cursor: 'pointer' }}>+</button>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 18 }}>
                    ${(seats * plan.perSeat!).toLocaleString()}<span style={{ fontSize: 11, fontWeight: 300, color: 'var(--mid-gray)' }}>/mo</span>
                  </span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--mid-gray)', marginTop: 6 }}>Min {plan.minSeats} seats · add more anytime from your account</div>
              </div>
            )}

            <hr style={{ marginBottom: 16 }} />
            {plan.features.map(f => (
              <div key={f} style={{ display: 'flex', gap: 8, fontSize: 13, color: 'var(--dark-gray)', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: '#22c55e', fontWeight: 700, fontSize: 11 }}>✓</span>{f}
              </div>
            ))}
            <div style={{ marginTop: 20, padding: '10px 12px', border: '1px solid var(--border)', background: 'var(--off-white)', fontSize: 10, color: 'var(--mid-gray)', letterSpacing: '0.06em' }}>
              SECURE CHECKOUT · CANCEL ANYTIME · NO HIDDEN FEES
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div>
          <div className="tag" style={{ marginBottom: 16 }}>Your information</div>
          <div className="checkout-panel">
            <form onSubmit={submit}>
              <div className="form-group">
                <label>First Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your first name" style={inputSt} />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inputSt} />
              </div>
              {isTeam && (
                <div style={{ border: '1px solid #bfdbfe', background: '#eff6ff', padding: '10px 12px', fontSize: 12, color: '#1d4ed8', marginBottom: 16, lineHeight: 1.5 }}>
                  Your team members will receive individual logins. You can add or remove seats anytime.
                </div>
              )}
              <button type="submit" className="btn-submit" disabled={!name.trim() || !email.trim()}>
                {plan.price === null && !isTeam ? 'Start Free Trial' : `Continue to Payment · ${priceStr}/mo`}
              </button>
              <p style={{ fontSize: 10.5, color: 'var(--mid-gray)', textAlign: 'center', marginTop: 12, letterSpacing: '0.04em' }}>
                By continuing you agree to our <Link to="#" style={{ textDecoration: 'underline' }}>Terms</Link> and <Link to="#" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>.
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Payment modal */}
      {showModal && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--white)', width: '100%', maxWidth: 460, height: 580, display: 'flex', flexDirection: 'column', border: 'none' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, fontWeight: 300 }}>medmed — Secure Payment</div>
                <div className="tag" style={{ marginTop: 2 }}>{plan.name}{isTeam ? ` · ${seats} seats` : ''} · {priceStr}/mo</div>
              </div>
              <button onClick={() => setShowModal(false)} style={{ fontSize: 18, color: 'var(--mid-gray)', cursor: 'pointer', padding: 4 }}>✕</button>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mid-gray)', fontSize: 13, fontStyle: 'italic' }}>
              Payment form loads here
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
