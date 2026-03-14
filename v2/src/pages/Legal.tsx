import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

function LegalPage({ title, tag, sections }: { title: string; tag: string; sections: { heading: string; body: string }[] }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <Nav />
      <div style={{ paddingTop: 56, maxWidth: 760, margin: '0 auto', padding: '64px 40px' }}>
        <div className="tag" style={{ marginBottom: 12 }}>{tag}</div>
        <h1 style={{ marginBottom: 8 }}>{title}</h1>
        <p style={{ fontSize: 12, color: 'var(--mid-gray)', marginBottom: 40 }}>Last updated: March 1, 2026</p>
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {sections.map(s => (
            <div key={s.heading} style={{ padding: '28px 0', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: 12 }}>{s.heading}</h3>
              <p style={{ fontSize: 14, color: 'var(--dark-gray)', lineHeight: 1.75 }}>{s.body}</p>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 40, display: 'flex', gap: 16, fontSize: 12, color: 'var(--mid-gray)' }}>
          <Link to="/" style={{ textDecoration: 'underline' }}>← Back to Home</Link>
          <Link to="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link>
          <Link to="/terms" style={{ textDecoration: 'underline' }}>Terms of Use</Link>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export function Privacy() {
  return <LegalPage tag="Policy Center" title="Privacy Policy" sections={[
    { heading: 'Information We Collect', body: 'We collect information you provide directly — such as your name, email, and the questions you ask. We do not sell or share this data with third parties for advertising purposes.' },
    { heading: 'How We Use Your Data', body: 'We use your data to provide and improve the services, process payments, and send transactional communications. We do not use your health queries to build advertising profiles.' },
    { heading: 'Data Storage & Security', body: 'All data is stored using industry-standard encryption. Payment information is processed by our payment provider and is never stored on our servers.' },
    { heading: 'Your Rights', body: 'You may request deletion of your account and associated data at any time by contacting support@medmed.ai. We will process your request within 30 days.' },
  ]} />
}

export function Terms() {
  return <LegalPage tag="Policy Center" title="Terms of Use" sections={[
    { heading: 'Acceptance', body: 'By using medmed.ai you agree to these terms. If you do not agree, please do not use the service.' },
    { heading: 'Informational Content Only', body: 'medmed.ai provides general information for educational purposes only. Nothing on this platform constitutes advice, diagnosis, or recommendation. Always consult a qualified care provider for health decisions.' },
    { heading: 'Subscriptions & Billing', body: 'Paid subscriptions are billed monthly. You may cancel at any time; your access continues until the end of the current billing period.' },
    { heading: 'Acceptable Use', body: 'You agree not to use medmed.ai to generate, distribute, or act on misinformation, or to circumvent any access controls on the platform.' },
    { heading: 'Limitation of Liability', body: 'medmed.ai is provided "as is." We are not liable for any harm arising from reliance on information provided by the platform.' },
  ]} />
}

export function Policy() {
  return <LegalPage tag="Policy Center" title="Acceptable Use Policy" sections={[
    { heading: 'Prohibited Usage', body: 'Users are prohibited from using medmed.ai for any unlawful purpose, to transmit harmful code, or to generate content that is intentionally misleading or harmful.' },
    { heading: 'Security', body: 'You may not attempt to gain unauthorized access to any portion of the service or any other systems or networks connected to the service.' },
    { heading: 'Fair Usage', body: 'We reserve the right to limit or terminate access for users who exceed reasonable usage limits or attempt to automate scraping of the platform.' }
  ]} />
}

export function Support() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--off-white)' }}>
      <Nav />
      <div style={{ paddingTop: 56, maxWidth: 760, margin: '0 auto', padding: '64px 40px' }}>
        <div className="tag" style={{ marginBottom: 12 }}>Customer Care</div>
        <h1 style={{ marginBottom: 8 }}>Help & Support</h1>
        <p style={{ fontSize: 16, color: 'var(--dark-gray)', marginBottom: 40, fontWeight: 300 }}>We are here to help you get the most out of medmed.ai.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ padding: 24, border: '1px solid var(--border)', background: 'var(--white)' }}>
            <h3 style={{ marginBottom: 12 }}>Contact Us</h3>
            <p style={{ fontSize: 13, color: 'var(--dark-gray)', lineHeight: 1.6, marginBottom: 16 }}>Need help with your account or billing? Reach out to our team.</p>
            <a href="mailto:support@medmed.ai" style={{ fontWeight: 600, color: 'var(--black)', textDecoration: 'underline', fontSize: 13 }}>support@medmed.ai</a>
          </div>
          <div style={{ padding: 24, border: '1px solid var(--border)', background: 'var(--white)' }}>
            <h3 style={{ marginBottom: 12 }}>Documentation</h3>
            <p style={{ fontSize: 13, color: 'var(--dark-gray)', lineHeight: 1.6, marginBottom: 16 }}>Learn how to use our tools and manage your history.</p>
            <Link to="/how-it-works" style={{ fontWeight: 600, color: 'var(--black)', textDecoration: 'underline', fontSize: 13 }}>View How It Works</Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
