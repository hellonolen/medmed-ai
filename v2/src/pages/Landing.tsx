import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="page">
      <Nav />

      {/* Hero */}
      <section style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="hero">
          <p className="hero-eyebrow">Advanced Health Research</p>
          <h1>Your personal<br />research<br />companion</h1>
          <p className="hero-sub">
            Ask any health question. Get clear, structured answers grounded in research knowledge —
            not internet noise. Start for free.
          </p>
          <div className="hero-actions">
            <Link to="/dashboard" className="btn-primary">Get Started Free</Link>
            <Link to="/pricing" className="btn-ghost">See Pricing</Link>
          </div>
        </div>
      </section>

      {/* Tools strip */}
      <div style={{ maxWidth: 960, margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', borderLeft: '1px solid var(--border)' }}>
          {[
            { icon: '◉', name: 'Symptom Tool', desc: 'Understand your symptoms clearly' },
            { icon: '⬡', name: 'Interactions', desc: 'Check for conflict between medications' },
            { icon: '◈', name: 'Finder', desc: 'Locate nearby services instantly' },
            { icon: '▣', name: 'Visualization', desc: 'Live visual analysis — Pro & above' },
          ].map(tool => (
            <div key={tool.name} style={{
              flex: 1, padding: '28px 24px',
              borderRight: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 20, marginBottom: 10, color: 'var(--mid-gray)' }}>{tool.icon}</div>
              <div style={{
                fontSize: 9.5, fontWeight: 600, letterSpacing: '0.16em',
                textTransform: 'uppercase', color: 'var(--mid-gray)', marginBottom: 6
              }}>{tool.name}</div>
              <p style={{ fontSize: 12.5, color: 'var(--dark-gray)', lineHeight: 1.5 }}>{tool.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ padding: '48px 40px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="tag">How it works</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
        <div className="feature-row">
          {[
            { num: '01', title: 'Ask your question', body: 'Type any health question. Use the camera for visual concerns. Everything is private and secure.' },
            { num: '02', title: 'Get structured answers', body: 'Receive clear, well-organized information built for clarity. No jargon, no noise.' },
            { num: '03', title: 'Take informed action', body: 'Use what you learn to have better conversations with your care provider or specialist.' },
          ].map(f => (
            <div key={f.num} className="feature-cell">
              <div className="feature-num">{f.num}</div>
              <h3>{f.title}</h3>
              <p style={{ marginTop: 10 }}>{f.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Plans preview */}
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <div style={{ padding: '48px 40px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span className="tag">Plans</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <Link to="/pricing" style={{ fontSize: 10.5, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--mid-gray)', fontWeight: 600 }}>
            View all plans →
          </Link>
        </div>
        <div className="plans-grid">
          {[
            { name: 'Free', tag: 'Start here', price: 'Free', sub: '3-day full access', features: ['Symptom Tool', 'Finder', 'Interactions', 'Web dashboard'], href: '/dashboard', featured: false },
            { name: 'Pro', tag: 'Most popular', price: '$20', sub: 'per month · 1 user', features: ['Everything in Free', 'Live visualization', '45-sec video', 'Conversation history', 'Document storage'], href: '/checkout?plan=pro', featured: true },
            { name: 'Max', tag: 'Power users', price: '$100', sub: 'per month · 1 user', features: ['Everything in Pro', '5× usage', 'Higher limits', 'Early access', 'Peak priority'], href: '/checkout?plan=max', featured: false },
          ].map(p => (
            <div key={p.name} className={`plan-card ${p.featured ? 'featured' : ''}`}>
              <div className="tag plan-tag">{p.tag}</div>
              <h3 className="plan-name">{p.name}</h3>
              <div className="plan-price">{p.price}</div>
              <div className="plan-sub">{p.sub}</div>
              <hr className="plan-divider" />
              {p.features.map(f => (
                <div key={f} className="feature-item">
                  <span className="check">✓</span>{f}
                </div>
              ))}
              <div className="plan-cta">
                <Link to={p.href} className={`btn-plan ${p.featured ? 'primary' : ''}`}>
                  {p.name === 'Free' ? 'Try it Free' : `Get ${p.name}`}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ maxWidth: 1200, margin: '48px auto 0' }}>
         <Footer />
      </div>
    </div>
  )
}
