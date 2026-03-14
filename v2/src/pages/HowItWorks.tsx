import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'

const STEPS = [
  {
    num: '01',
    title: 'Ask your question',
    body: 'Type anything — a symptom, a medication name, a condition youve read about. You dont need to know the right terminology. Just ask.',
  },
  {
    num: '02',
    title: 'Get a clear, organized answer',
    body: 'medmed.ai draws from a broad knowledge base to give you a structured, plain-language response. No wading through forum posts or ad-filled articles.',
  },
  {
    num: '03',
    title: 'Dig deeper with specialized tools',
    body: 'Use our Symptom tool, Interactions tool, or Finder for more focused lookups. Or point your camera at a label or concern for a visual read.',
  },
  {
    num: '04',
    title: 'Save and revisit',
    body: 'Your conversation history is saved to your account. Come back to a previous session, pick up where you left off, or share a summary.',
  },
]

const TOOLS = [
  { icon: '◈', name: 'Chat', desc: 'Ask anything, get a clear answer. The starting point for most lookups.', path: '/dashboard' },
  { icon: '◉', name: 'Symptom Tool', desc: 'Walk through symptoms step by step. Get structured information about possible causes and when to seek care.', path: '/symptom-checker' },
  { icon: '⬡', name: 'Drug Interactions', desc: 'Check multiple medications against each other. Understand overlap, timing, and what to watch for.', path: '/interactions' },
  { icon: '▤', name: 'Finder', desc: 'Find nearby pharmacies by ZIP or location. Filter by hours, services, and insurance.', path: '/pharmacy' },
  { icon: '⊙', name: 'Camera', desc: 'Point your camera at a label, a rash, or a skin concern. Get a plain-language read on what you are looking at. Pro plan.', path: '/camera' },
]

export default function HowItWorks() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <Nav />
      <div style={{ paddingTop: 56 }}>

        {/* Hero */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '72px 40px 56px', borderBottom: '1px solid var(--border)' }}>
          <div className="tag" style={{ marginBottom: 16 }}>How It Works</div>
          <h1 style={{ maxWidth: 560, marginBottom: 16 }}>You ask. We look it up.<br />You leave knowing more.</h1>
          <p style={{ fontSize: 16, color: 'var(--dark-gray)', fontWeight: 300, lineHeight: 1.75, maxWidth: 520 }}>
            medmed.ai is an information tool. It doesnt diagnose, prescribe, or replace a conversation with your care provider — it gives you the background context to have a better one.
          </p>
        </div>

        {/* Steps */}
        <div style={{ maxWidth: 900, margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: '40px 40px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="tag">The flow</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--border)' }}>
            {STEPS.map((s, i) => (
              <div key={s.num} style={{
                padding: '40px 40px',
                borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
                borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                background: 'var(--white)',
              }}>
                <div style={{ fontSize: 32, fontWeight: 200, color: 'var(--light-gray)', marginBottom: 16, fontFamily: 'var(--font-serif)' }}>{s.num}</div>
                <h3 style={{ marginBottom: 10, fontSize: 18 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--dark-gray)', lineHeight: 1.7 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div style={{ maxWidth: 900, margin: '0 auto', borderBottom: '1px solid var(--border)' }}>
          <div style={{ padding: '40px 40px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="tag">The tools</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {TOOLS.map((t, i) => (
              <div key={t.name} style={{
                display: 'grid', gridTemplateColumns: '56px 1fr auto',
                alignItems: 'center', gap: 24,
                padding: '24px 40px',
                background: 'var(--white)',
                borderBottom: i < TOOLS.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ fontSize: 22, color: 'var(--dark-gray)', textAlign: 'center' }}>{t.icon}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{t.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--dark-gray)', lineHeight: 1.6 }}>{t.desc}</div>
                </div>
                <Link to={t.path} style={{
                  padding: '8px 18px', border: '1px solid var(--border)', background: 'transparent',
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--dark-gray)', textDecoration: 'none', whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}>Try it</Link>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <h2 style={{ marginBottom: 10 }}>Ready to start?</h2>
            <p style={{ fontSize: 14, color: 'var(--dark-gray)' }}>No account required to use the chat. Create one to save your history.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/dashboard" style={{
              padding: '13px 28px', background: 'var(--black)', color: 'var(--white)',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none',
            }}>Open Chat</Link>
            <Link to="/pricing" style={{
              padding: '13px 28px', border: '1px solid var(--border)', background: 'transparent',
              fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--dark-gray)',
            }}>See Pricing</Link>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <Footer />
        </div>
      </div>
    </div>
  )
}
