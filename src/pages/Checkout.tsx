import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SiteNav } from '@/components/SiteNav';

/* ─── Plan definitions ────────────────────────────────────────────────── */
const PLANS: Record<string, {
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  whopId: string;
}> = {
  free: {
    name: 'Free',
    price: 'Free',
    priceNote: '3-day full access trial',
    features: ['Symptom Checker', 'Pharmacy Finder', 'Interaction Checker', 'Web chat'],
    whopId: 'prod_m4YcsLjLvqgJv',
  },
  pro: {
    name: 'Pro',
    price: '$20',
    priceNote: 'per month',
    features: ['Unlimited questions', 'Live camera analysis', '45-second video analysis', 'Conversation history', 'Document storage', 'Priority response'],
    whopId: 'prod_OXayRSUGg4pkO',
  },
  max: {
    name: 'Max',
    price: '$100',
    priceNote: 'per month',
    features: ['Everything in Pro', '5× more usage', 'Higher output limits', 'Early feature access', 'Priority access at peak times'],
    whopId: 'prod_bWovo3uiTso3D',
  },
  team: {
    name: 'Team',
    price: '$25',
    priceNote: 'per seat / month',
    features: ['Everything in Pro', 'Centralized team billing', 'Usage dashboard', 'Admin controls'],
    whopId: 'prod_jceMMMPVZWTEK',
  },
  enterprise: {
    name: 'Enterprise',
    price: '$35',
    priceNote: 'per seat / month',
    features: ['Everything in Team', 'Dedicated support', 'Custom onboarding', 'SLA guarantee'],
    whopId: 'prod_kAKGW5R49G3EH',
  },
};

const PLAN_ORDER = ['free', 'pro', 'max', 'team', 'enterprise'];

/* ─── Component ───────────────────────────────────────────────────────── */
export default function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialPlan = params.get('plan') || 'pro';
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [showPayment, setShowPayment] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'select' | 'info'>('select');

  const plan = PLANS[selectedPlan] || PLANS.pro;

  // Close payment modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowPayment(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const checkoutUrl = `https://whop.com/embed/checkout/${plan.whopId}/?d=https://medmed.ai/checkout-success&metadata[email]=${encodeURIComponent(email)}&metadata[name]=${encodeURIComponent(name)}`;

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setShowPayment(true);
  };

  return (
    <>
      <SiteNav />

      <div style={{ minHeight: '100vh', background: '#faf7f2', paddingTop: 80 }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1a1a1a', letterSpacing: -0.5 }}>
              Choose your plan
            </h1>
            <p style={{ color: '#888', marginTop: 6, fontSize: 15 }}>
              Start with a 3-day free trial. Cancel anytime.
            </p>
          </div>

          {/* Plan selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 36 }}>
            {PLAN_ORDER.map(key => {
              const p = PLANS[key];
              const active = selectedPlan === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedPlan(key)}
                  style={{
                    padding: '14px 12px',
                    borderRadius: 12,
                    border: active ? '2px solid #1a1a1a' : '1px solid #ddd',
                    background: active ? '#1a1a1a' : '#fff',
                    color: active ? '#fff' : '#333',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div>
                  <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>{p.price}</div>
                </button>
              );
            })}
          </div>

          {/* Two-column layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

            {/* Left — Plan summary */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e5e0d8' }}>
              <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#999', marginBottom: 6 }}>
                Selected plan
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: '#1a1a1a' }}>{plan.price}</span>
                {plan.price !== 'Free' && (
                  <span style={{ fontSize: 13, color: '#999' }}>{plan.priceNote}</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
                {plan.price === 'Free' ? plan.priceNote : ''}
              </div>

              <div style={{ borderTop: '1px solid #f0ebe3', paddingTop: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: '#999', marginBottom: 12 }}>
                  Included
                </div>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, color: '#333' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>
                    {f}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20, padding: '12px 14px', background: '#f8f5f0', borderRadius: 8, fontSize: 12, color: '#888' }}>
                🔒 Secure checkout · Cancel anytime · No hidden fees
              </div>
            </div>

            {/* Right — Info form */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e5e0d8' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 20 }}>
                Your information
              </div>

              <form onSubmit={handleContinue} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your first name"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8,
                      border: '1px solid #ddd', fontSize: 14, outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: 8,
                      border: '1px solid #ddd', fontSize: 14, outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ marginTop: 8 }}>
                  <button
                    type="submit"
                    disabled={!name.trim() || !email.trim()}
                    style={{
                      width: '100%',
                      padding: '13px',
                      background: !name.trim() || !email.trim() ? '#ccc' : '#1a1a1a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 10,
                      fontSize: 15,
                      fontWeight: 700,
                      cursor: !name.trim() || !email.trim() ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    {plan.price === 'Free' ? 'Start Free Trial →' : `Continue to Payment →`}
                  </button>
                </div>

                <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', margin: 0 }}>
                  By continuing you agree to our{' '}
                  <a href="/terms" style={{ color: '#888' }}>Terms</a> and{' '}
                  <a href="/privacy" style={{ color: '#888' }}>Privacy Policy</a>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Payment modal ─────────────────────────────────────────────── */}
      {showPayment && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowPayment(false); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <div style={{
            background: '#fff', borderRadius: 20, overflow: 'hidden',
            width: '100%', maxWidth: 480, height: 620,
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          }}>
            {/* Modal header */}
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #f0ebe3',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fff',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>
                  medmed.ai — Secure Payment
                </div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {plan.name} · {plan.price}{plan.price !== 'Free' ? `/${plan.priceNote.replace('per ', '')}` : ''}
                </div>
              </div>
              <button
                onClick={() => setShowPayment(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#999', padding: 4 }}
              >
                ✕
              </button>
            </div>

            {/* Payment iframe */}
            <iframe
              src={checkoutUrl}
              title="Secure Payment"
              style={{ flex: 1, border: 'none', width: '100%' }}
              allow="payment"
              sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation allow-popups"
            />
          </div>
        </div>
      )}
    </>
  );
}
