import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--border)',
      padding: '32px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      fontSize: 11.5,
      color: 'var(--mid-gray)',
      flexWrap: 'wrap',
      gap: 24,
    }}>
      {/* Left — brand + year */}
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--dark-gray)', marginBottom: 4 }}>medmed.ai</div>
        <div style={{ fontSize: 10.5 }}>© 2026 medmed.ai · All rights reserved</div>
        <div style={{ fontSize: 10.5, marginTop: 4, maxWidth: 320, lineHeight: 1.6 }}>
          For informational purposes only. Not a substitute for professional advice.
        </div>
      </div>

      {/* Right — link groups */}
      <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
        {/* Policy Center */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dark-gray)', marginBottom: 10 }}>Policy Center</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Link to="/privacy" style={{ color: 'var(--mid-gray)', textDecoration: 'none', fontSize: 11.5 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--black)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--mid-gray)'}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: 'var(--mid-gray)', textDecoration: 'none', fontSize: 11.5 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--black)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--mid-gray)'}>Terms of Use</Link>
            <Link to="/policy" style={{ color: 'var(--mid-gray)', textDecoration: 'none', fontSize: 11.5 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--black)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--mid-gray)'}>Acceptable Use</Link>
          </div>
        </div>

        {/* Business Center */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dark-gray)', marginBottom: 10 }}>Business Center</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Link to="/pricing" style={{ color: 'var(--mid-gray)', textDecoration: 'none', fontSize: 11.5 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--black)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--mid-gray)'}>Pricing</Link>
            <Link to="/pricing?tab=team" style={{ color: 'var(--mid-gray)', textDecoration: 'none', fontSize: 11.5 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--black)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--mid-gray)'}>Teams & Enterprise</Link>
            <Link to="/checkout" style={{ color: 'var(--mid-gray)', textDecoration: 'none', fontSize: 11.5 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--black)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--mid-gray)'}>Billing</Link>
          </div>
        </div>

        {/* Support */}
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--dark-gray)', marginBottom: 10 }}>Support</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Link to="/support" style={{ color: 'var(--mid-gray)', textDecoration: 'none', fontSize: 11.5 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--black)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--mid-gray)'}>Help Center</Link>
            <a href="mailto:support@medmed.ai" style={{ color: 'var(--mid-gray)', textDecoration: 'none', fontSize: 11.5 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--black)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--mid-gray)'}>Contact Us</a>
            <Link to="/about" style={{ color: 'var(--mid-gray)', textDecoration: 'none', fontSize: 11.5 }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--black)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--mid-gray)'}>About</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
