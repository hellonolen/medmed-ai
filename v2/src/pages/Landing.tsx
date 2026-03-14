import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import GlobalFooter from "../components/GlobalFooter"
import Nav from "../components/Nav"

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--black)' }}>{q}</span>
        <span style={{ fontSize: 22, color: 'var(--mid-gray)', transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 24, fontSize: 14.5, color: 'var(--dark-gray)', lineHeight: 1.65, maxWidth: 800 }}>{a}</div>
      )}
    </div>
  );
}

export default function Landing() {
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://medmed-agent.hellonolen.workers.dev/api/stats")
      .then(r => r.json() as Promise<{ totalQuestions: number }>)
      .then(d => { if (d.totalQuestions > 0) setLiveCount(d.totalQuestions); })
      .catch(() => {});
  }, []);

  return (
    <div className="page">
      <Nav />

      {/* Hero */}
      <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--off-white)' }}>
        <div className="hero">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 30, background: 'var(--light-gray)', fontSize: 11, fontWeight: 600, color: 'var(--dark-gray)', marginBottom: 32, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }}></span>
            {liveCount ? `${liveCount.toLocaleString()} queries resolved` : "Enterprise & Pro Available"}
          </div>
          <h1>Your personal<br />research<br />companion</h1>
          <p className="hero-sub" style={{ maxWidth: 640 }}>
            Ask any health question. Get clear, structured answers grounded in research knowledge — not internet noise. Leverage Agentic Intelligence to make informed decisions.
          </p>
          <div className="hero-actions" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
            <Link to="/pricing" className="btn-primary" style={{ padding: '16px 32px', fontSize: 12, width: '100%', maxWidth: 320, textAlign: 'center' }}>View Pro & Enterprise</Link>
            <Link to="/signup" className="btn-ghost" style={{ padding: '16px 32px', fontSize: 12, width: '100%', maxWidth: 320, textAlign: 'center' }}>Create Account</Link>
          </div>
        </div>
      </section>

      {/* Tools strip */}
      <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--white)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
            {[
              { icon: '◉', name: 'Symptom Tool', desc: 'Understand your symptoms clearly before appointments' },
              { icon: '⬡', name: 'Interactions', desc: 'Check for systemic conflicts between medications' },
              { icon: '◈', name: 'Pharmacy Finder', desc: 'Locate nearby automated services instantly' },
              { icon: '▣', name: 'Visual Analytics', desc: 'Pro feature: Live visual analysis via device camera' },
            ].map((tool, i) => (
              <div key={tool.name} style={{
                flex: '1 1 250px', padding: '32px 32px',
                borderRight: i < 3 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ fontSize: 24, marginBottom: 12, color: 'var(--black)' }}>{tool.icon}</div>
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
                  textTransform: 'uppercase', color: 'var(--black)', marginBottom: 8
                }}>{tool.name}</div>
                <p style={{ fontSize: 13, color: 'var(--dark-gray)', lineHeight: 1.6 }}>{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works / Features */}
      <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--off-white)' }}>
        <div className="section-header" style={{ padding: '64px 40px 32px' }}>
          <span className="tag">Platform Capability </span>
        </div>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 40px 64px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>
            <div>
              <h3 style={{ fontSize: 26, marginBottom: 16 }}>Natural Language Queries</h3>
              <p style={{ fontSize: 15, color: 'var(--dark-gray)' }}>You do not need to use terminology. Ask exactly what you would say to a specialist. Get immediate, structured breakdowns without sifting through ads.</p>
            </div>
            <div>
              <h3 style={{ fontSize: 26, marginBottom: 16 }}>Pro Camera Analytics</h3>
              <p style={{ fontSize: 15, color: 'var(--dark-gray)' }}>Take a live photo of a visible concern or label. The system analyzes what it sees and returns context in real-time. Saved securely to your Private History.</p>
            </div>
            <div>
              <h3 style={{ fontSize: 26, marginBottom: 16 }}>Enterprise Ready</h3>
              <p style={{ fontSize: 15, color: 'var(--dark-gray)' }}>Built on a sovereign engine with zero data leakage. Deploy across teams with shared analytics and API access.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--white)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 40px' }}>
          <div className="tag" style={{ marginBottom: 20 }}>About medmed</div>
          <h2 style={{ fontSize: 36, marginBottom: 24 }}>Information, not advice.</h2>
          <p style={{ fontSize: 17, color: 'var(--dark-gray)', marginBottom: 20, lineHeight: 1.8 }}>
            We build conversational tools that help people access health and pharmaceutical information quickly, clearly, and on demand.
            We are not a healthcare provider. What we do is give you access to structured, educational context so you can have better, more informed conversations with your care team.
          </p>
          <Link to="/about" style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--black)', textDecoration: 'underline' }}>Read our full mission</Link>
        </div>
      </section>

      {/* Pricing Preview */}
      <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--off-white)' }}>
        <div className="section-header" style={{ padding: '64px 40px 32px' }}>
          <span className="tag">Investment Tiers</span>
        </div>
        
        <div className="plans-grid" style={{ maxWidth: 1040, background: 'var(--white)', marginBottom: 64, border: '1px solid var(--border)', borderTop: 'none' }}>
          {/* Pro Plan */}
          <div className="plan-card">
            <div className="plan-tag tag">Professional</div>
            <h3 className="plan-name">Pro License</h3>
            <div className="plan-price">$20<span style={{ fontSize: 16, color: 'var(--mid-gray)', fontStyle: 'normal', fontFamily: 'var(--font-sans)' }}>/mo</span></div>
            <p className="plan-sub">For individuals demanding visual analytics and persistent history.</p>
            
            <hr className="plan-divider" />
            <div className="feature-item"><span className="check">✓</span> Unlimited Chat Queries</div>
            <div className="feature-item"><span className="check">✓</span> Live Camera Visual Analytics</div>
            <div className="feature-item"><span className="check">✓</span> 45s Video Diagnostics</div>
            <div className="feature-item"><span className="check">✓</span> Permanent Secure History</div>
            
            <div className="plan-cta">
              <Link to="/pricing" className="btn-plan">View Pro Plans</Link>
            </div>
          </div>

          {/* Max Plan */}
          <div className="plan-card featured">
            <div className="plan-tag tag">Power User</div>
            <h3 className="plan-name">Max License</h3>
            <div className="plan-price">$100<span style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', fontStyle: 'normal', fontFamily: 'var(--font-sans)' }}>/mo</span></div>
            <p className="plan-sub">For heavy volume usage and priority access.</p>
            
            <hr className="plan-divider" />
            <div className="feature-item"><span className="check">✓</span> Everything in Pro</div>
            <div className="feature-item"><span className="check">✓</span> 5× Output Limits</div>
            <div className="feature-item"><span className="check">✓</span> Priority Peak Access</div>
            <div className="feature-item"><span className="check">✓</span> Early Feature Access</div>
            
            <div className="plan-cta">
              <Link to="/pricing" className="btn-plan primary">View Max Plans</Link>
            </div>
          </div>

          {/* Enterprise */}
          <div className="plan-card">
            <div className="plan-tag tag">Enterprise</div>
            <h3 className="plan-name">Organization</h3>
            <div className="plan-price">Custom</div>
            <p className="plan-sub">Deploy across your facility with zero data leakage.</p>
            
            <hr className="plan-divider" />
            <div className="feature-item"><span className="check">✓</span> API Integration Access</div>
            <div className="feature-item"><span className="check">✓</span> Multi-seat Management</div>
            <div className="feature-item"><span className="check">✓</span> Advanced SSO</div>
            <div className="feature-item"><span className="check">✓</span> Dedicated Account Executive</div>
            
            <div className="plan-cta">
              <Link to="/contact" className="btn-plan">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Community & Onboarding (Affiliates, Sponsors, Enterprise) */}
      <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--white)' }}>
        <div className="section-header" style={{ padding: '64px 40px 32px' }}>
          <span className="tag">Community & Growth </span>
        </div>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 40px 64px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 48 }}>
            <div style={{ border: '1px solid var(--border)', padding: '32px', borderRadius: 8, background: 'var(--off-white)' }}>
              <div className="tag" style={{ marginBottom: 12 }}>Partnership</div>
              <h3 style={{ fontSize: 24, marginBottom: 16 }}>Affiliates Hub</h3>
              <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 24 }}>Join our network of healthcare advocates. Earn recurring commission by referring professionals to MedMed.AI.</p>
              <Link to="/affiliates" className="btn-ghost" style={{ display: 'inline-block', width: '100%', textAlign: 'center', padding: '12px', background: 'var(--white)' }}>Apply Now</Link>
            </div>
            
            <div style={{ border: '1px solid var(--border)', padding: '32px', borderRadius: 8, background: 'var(--off-white)' }}>
              <div className="tag" style={{ marginBottom: 12 }}>Brand Visibility</div>
              <h3 style={{ fontSize: 24, marginBottom: 16 }}>Sponsors Onboarding</h3>
              <p style={{ fontSize: 14, color: 'var(--dark-gray)', marginBottom: 24 }}>Position your research or medical devices in front of a highly targeted, verified audience of professionals.</p>
              <Link to="/sponsors" className="btn-ghost" style={{ display: 'inline-block', width: '100%', textAlign: 'center', background: 'var(--white)' }}>View Media Kit</Link>
            </div>
            
            <div style={{ border: '1px solid var(--border)', padding: '32px', borderRadius: 8, background: 'var(--black)', color: 'var(--white)' }}>
              <div className="tag" style={{ marginBottom: 12, color: 'rgba(255,255,255,0.6)' }}>Scale</div>
              <h3 style={{ fontSize: 24, marginBottom: 16, color: 'var(--white)' }}>Enterprise & Hospitals</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 24 }}>Custom deployments with strict HIPAA compliance walls. We build tailored visual integration models for your specific organizational requirements.</p>
              <Link to="/contact" className="btn-primary" style={{ display: 'inline-block', width: '100%', textAlign: 'center', background: 'var(--white)', color: 'var(--black)' }}>Request Briefing</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ borderBottom: '1px solid var(--border)', background: 'var(--white)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '80px 40px' }}>
          <h2 style={{ fontSize: 36, marginBottom: 40 }}>Frequently Asked Questions</h2>
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {[
              { q: 'Is this a medical service?', a: 'No. MedMed is an informational tool. Nothing produced by this platform constitutes medical advice, a diagnosis, or a treatment recommendation. Always seek the advice of your physician.' },
              { q: 'What does Pro add?', a: 'Pro gives you unlimited questions, saved conversation history, document storage, and priority responses. It also unlocks the camera and video features — you can take a live photo or record up to 45 seconds of video and receive a detailed description.' },
              { q: 'How does the Visual Analytics work?', a: 'On the Pro plan, tap the camera button to open your device camera and take a live photo. The system analyzes the image and returns a written analysis. No images from your camera roll can be uploaded — live capture only.' },
              { q: 'Is my data private?', a: 'Yes. Your conversations and media captures are strictly tied to your account. They are not shared with insurers or third parties.' },
              { q: 'Can organizations deploy this?', a: 'Yes, Enterprise plans offer API access, SSO, and multi-seat management capabilities for clinics and organizations.' },
            ].map(faq => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section style={{ background: 'var(--off-white)', padding: '100px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 40, marginBottom: 16 }}>Ready to see the difference?</h2>
        <p style={{ fontSize: 16, color: 'var(--dark-gray)', marginBottom: 40, maxWidth: 500, margin: '0 auto 40px' }}>
          Invest in your access to high-fidelity, structured intelligence.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
          <Link to="/pricing" className="btn-primary" style={{ padding: '16px 36px', fontSize: 12, width: '100%', maxWidth: 300 }}>View Pro & Enterprise</Link>
          <Link to="/signup" className="btn-ghost" style={{ padding: '16px 36px', fontSize: 12, width: '100%', maxWidth: 300, background: 'var(--white)' }}>Sign Up</Link>
        </div>
      </section>

      <GlobalFooter />
    </div>
  )
}
