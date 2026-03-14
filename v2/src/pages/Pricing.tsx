import { useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

type Tab = 'individual' | 'team'

function SeatCounter({ seats, min, perSeat, onChange }: { seats: number; min: number; perSeat: number; onChange: (n: number) => void }) {
  return (
    <div className="seat-counter">
      <div className="tag">Team size</div>
      <div className="seat-row">
        <button className="seat-btn" onClick={() => onChange(Math.max(min, seats - 1))}>−</button>
        <span style={{ fontWeight: 700, fontSize: 20, minWidth: 28, textAlign: 'center' }}>{seats}</span>
        <button className="seat-btn" onClick={() => onChange(seats + 1)}>+</button>
        <span style={{ fontSize: 12, color: 'var(--mid-gray)' }}>seats</span>
        <span className="seat-total">${(seats * perSeat).toLocaleString()}<span style={{ fontSize: 11, fontWeight: 300, color: 'var(--mid-gray)' }}>/mo</span></span>
      </div>
      <div style={{ fontSize: 10.5, color: 'var(--mid-gray)', marginTop: 6 }}>
        ${perSeat}/seat · min {min} seats · add more anytime
      </div>
    </div>
  )
}

const individualPlans = [
  {
    name: 'Free', tag: 'Start here', price: 'Free', sub: '3-day full access · 1 user',
    href: '/dashboard',
    features: ['Symptom Checker', 'Pharmacy Finder', 'Drug Interactions', 'Chat'],
    featured: false, cta: 'Try It Free',
  },
  {
    name: 'Pro', tag: 'Most popular', price: '$20', sub: 'per month · 1 user',
    href: '/checkout?plan=pro',
    features: ['Everything in Free', 'Live camera analysis', 'Conversation history', 'Document storage', 'Priority response'],
    featured: true, cta: 'Get Pro',
  },
  {
    name: 'Max', tag: 'Power users', price: '$100', sub: 'per month · 1 user',
    href: '/checkout?plan=max',
    features: ['Everything in Pro', '5× more lookups', 'Higher output limits', 'Early feature access', 'Peak priority'],
    featured: false, cta: 'Get Max',
  },
]

export default function Pricing() {
  const [tab, setTab] = useState<Tab>('individual')
  const [teamSeats, setTeamSeats] = useState(5)
  const [entSeats, setEntSeats] = useState(5)

  return (
    <div className="page">
      <Nav />

      {/* Page header */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '56px 40px 32px', borderBottom: '1px solid var(--border)' }}>
        <div className="tag" style={{ marginBottom: 14 }}>Pricing</div>
        <h1>Simple, transparent<br />pricing</h1>
        <p style={{ fontSize: 16, color: 'var(--dark-gray)', marginTop: 14, fontWeight: 300 }}>
          Start with full access, free. Upgrade or add seats anytime.
        </p>
      </div>

      {/* Tab switcher */}
      <div style={{ maxWidth: 960, margin: '0 auto', borderBottom: '1px solid var(--border)', display: 'flex' }}>
        {(['individual', 'team'] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '16px 28px',
            fontSize: 10.5, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase',
            borderBottom: tab === t ? '2px solid var(--black)' : '2px solid transparent',
            color: tab === t ? 'var(--black)' : 'var(--mid-gray)',
            background: 'none', cursor: 'pointer', marginBottom: -1,
          }}>
            {t === 'individual' ? 'Individual' : 'Team & Enterprise'}
          </button>
        ))}
      </div>

      {/* Individual plans */}
      {tab === 'individual' && (
        <div className="plans-grid" style={{ marginTop: 0 }}>
          {individualPlans.map(p => (
            <div key={p.name} className={`plan-card ${p.featured ? 'featured' : ''}`}>
              <div className="tag plan-tag">{p.tag}</div>
              <h3 className="plan-name">{p.name}</h3>
              <div className="plan-price">{p.price}</div>
              <div className="plan-sub">{p.sub}</div>
              <hr className="plan-divider" />
              {p.features.map(f => (
                <div key={f} className="feature-item"><span className="check">✓</span>{f}</div>
              ))}
              <div className="plan-cta">
                <Link to={p.href} className={`btn-plan ${p.featured ? 'primary' : ''}`}>
                  {p.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team & Enterprise */}
      {tab === 'team' && (
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--border)' }}>
          {/* Team */}
          <div className="plan-card" style={{ borderRight: '1px solid var(--border)' }}>
            <div className="tag plan-tag">5+ members</div>
            <h3 className="plan-name">Team</h3>
            <div className="plan-price">$25</div>
            <div className="plan-sub">per seat / month</div>
            <hr className="plan-divider" />
            <SeatCounter seats={teamSeats} min={5} perSeat={25} onChange={setTeamSeats} />
            {['Everything in Pro', 'Central billing', 'Seat management', 'Usage dashboard', 'Admin controls', 'Priority support'].map(f => (
              <div key={f} className="feature-item"><span className="check">✓</span>{f}</div>
            ))}
            <div className="plan-cta">
              <Link to={`/checkout?plan=team&seats=${teamSeats}`} className="btn-plan">
                Get Team · ${(teamSeats * 25).toLocaleString()}/mo
              </Link>
            </div>
          </div>

          {/* Enterprise */}
          <div className="plan-card featured">
            <div className="tag plan-tag">Large organizations</div>
            <h3 className="plan-name">Enterprise</h3>
            <div className="plan-price">$35</div>
            <div className="plan-sub">per seat / month</div>
            <hr className="plan-divider" />
            <SeatCounter seats={entSeats} min={5} perSeat={35} onChange={setEntSeats} />
            {['Everything in Team', 'Role-based access', 'Audit logs', 'Data retention controls', 'Dedicated onboarding', 'Dedicated support'].map(f => (
              <div key={f} className="feature-item"><span className="check">✓</span>{f}</div>
            ))}
            <div className="plan-cta">
              <Link to={`/checkout?plan=enterprise&seats=${entSeats}`} className="btn-plan primary">
                Get Enterprise · ${(entSeats * 35).toLocaleString()}/mo
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <span className="tag">FAQ</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        {[
          { q: 'Can I add more seats later?', a: 'Yes. You can increase or decrease your seat count at any time from your account. Changes are prorated to your billing cycle.' },
          { q: 'How is payment stored?', a: 'Your card is stored securely through our payment processor. You can update or remove it at any time from your account — no contact with support required.' },
          { q: 'Is this a replacement for a care provider?', a: 'No. medmed.ai provides informational content to help you understand topics better. Always speak with a qualified care provider before making health decisions.' },
          { q: 'What happens after the free trial?', a: 'Your account moves to a limited free tier. You can upgrade at any time to restore full access. No charges without your action.' },
        ].map(({ q, a }) => (
          <div key={q} style={{ borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 16, fontWeight: 300, marginBottom: 8 }}>{q}</div>
            <div style={{ fontSize: 13.5, color: 'var(--dark-gray)', lineHeight: 1.65 }}>{a}</div>
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <Footer />
      </div>
    </div>
  )
}
