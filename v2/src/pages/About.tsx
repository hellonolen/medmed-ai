import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <Nav />
      <div style={{ paddingTop: 56 }}>
        {/* Hero */}
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '72px 40px 56px', borderBottom: '1px solid var(--border)' }}>
          <div className="tag" style={{ marginBottom: 16 }}>About medmed.ai</div>
          <h1 style={{ maxWidth: 540 }}>We built the health research<br />companion we always wanted</h1>
        </div>

        {/* Mission */}
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 0, borderBottom: '1px solid var(--border)' }}>
            <div style={{ padding: '48px 40px', borderRight: '1px solid var(--border)' }}>
              <div className="tag">Our Mission</div>
            </div>
            <div style={{ padding: '48px 40px' }}>
              <p style={{ fontSize: 17, fontWeight: 300, lineHeight: 1.75, color: 'var(--dark-gray)', marginBottom: 20 }}>
                Health information is abundant but clarity is rare. We built medmed.ai to cut through the noise — giving people the structured, plain-language answers they need to make informed decisions and have better conversations with their care teams.
              </p>
              <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.75, color: 'var(--dark-gray)' }}>
                We are not a replacement for your care provider. We are the tool you reach for at 2am when something doesn't feel right and you need a clear answer — not ten contradictory forum posts.
              </p>
            </div>
          </div>

          {/* Values */}
          <div style={{ borderBottom: '1px solid var(--border)' }}>
            <div style={{ padding: '48px 40px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span className="tag">What we stand for</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderTop: '1px solid var(--border)' }}>
              {[
                { title: 'Clarity over volume', body: 'We prioritize structured, scannable answers over long-form walls of text. Your health questions deserve real answers, not ad-stuffed articles.' },
                { title: 'Privacy first', body: 'Your conversations are yours. We do not sell your data, share it with insurers, or use it to target you with advertising.' },
                { title: 'Transparent about what we are', body: 'medmed.ai is an informational tool. Every response includes clear guidance for when to speak with a professional.' },
                { title: 'Accessible pricing', body: 'We offer a generous free trial and straightforward pricing for individuals, teams, and enterprise organizations — no hidden fees.' },
              ].map((v, i) => (
                <div key={v.title} style={{
                  padding: '36px 40px',
                  borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
                  borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                }}>
                  <h3 style={{ marginBottom: 12 }}>{v.title}</h3>
                  <p style={{ fontSize: 13.5, color: 'var(--dark-gray)', lineHeight: 1.65 }}>{v.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div style={{ padding: '64px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
            <div>
              <h2 style={{ marginBottom: 10 }}>Ready to get started?</h2>
              <p style={{ fontSize: 14, color: 'var(--dark-gray)' }}>No account required. Just open the chat and ask.</p>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/dashboard" style={{
                padding: '13px 28px', background: 'var(--black)', color: 'var(--white)',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none',
              }}>Try It Free</Link>
              <Link to="/pricing" style={{
                padding: '13px 28px', border: '1px solid var(--border)', background: 'transparent',
                fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--dark-gray)',
              }}>See Pricing</Link>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <Footer />
        </div>
      </div>
    </div>
  )
}
