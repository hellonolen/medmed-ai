import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SiteNav } from '@/components/SiteNav';

/* ─── Plan config ─────────────────────────────────────────────────── */
const PLANS: Record<string, {
  name: string; price: number | null; priceLabel: string;
  perSeat?: number; minSeats?: number;
  priceNote: string; features: string[]; whopId: string;
}> = {
  free:       { name: 'Free',       price: null,  priceLabel: 'Free',  priceNote: '3-day full access trial', whopId: 'prod_m4YcsLjLvqgJv', features: ['Symptom Checker','Pharmacy Finder','Interaction Checker','Web chat'] },
  pro:        { name: 'Pro',        price: 20,    priceLabel: '$20',   priceNote: 'per month · 1 user',      whopId: 'prod_OXayRSUGg4pkO', features: ['Unlimited questions','Live camera analysis','45-sec video','Conversation history','Document storage','Priority response'] },
  max:        { name: 'Max',        price: 100,   priceLabel: '$100',  priceNote: 'per month · 1 user',      whopId: 'prod_bWovo3uiTso3D', features: ['Everything in Pro','5× more usage','Higher output limits','Early feature access','Peak priority'] },
  team:       { name: 'Team',       price: null,  priceLabel: '$25',   priceNote: 'per seat / month',        whopId: 'prod_jceMMMPVZWTEK', perSeat: 25, minSeats: 5, features: ['Everything in Pro','Central billing','Seat management','Usage dashboard','Admin controls','Priority support'] },
  enterprise: { name: 'Enterprise', price: null,  priceLabel: '$35',   priceNote: 'per seat / month',        whopId: 'prod_kAKGW5R49G3EH', perSeat: 35, minSeats: 5, features: ['Everything in Team','Role-based access','Audit logs','Dedicated onboarding','SLA guarantee'] },
};

const PLAN_ORDER = ['free', 'pro', 'max', 'team', 'enterprise'];

/* ─── Seat Counter ──────────────────────────────────────────────────── */
function SeatCounter({ seats, min, perSeat, onChange }: { seats: number; min: number; perSeat: number; onChange: (n: number) => void }) {
  return (
    <div style={{ background: '#fff8f0', border: '1px solid #e0d0b8', borderRadius: 10, padding: '12px 14px', marginTop: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Seats</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => onChange(Math.max(min, seats - 1))}
          style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #ddd', background: '#fff', fontSize: 16, cursor: 'pointer' }}>−</button>
        <span style={{ fontSize: 20, fontWeight: 800, minWidth: 28, textAlign: 'center' }}>{seats}</span>
        <button onClick={() => onChange(seats + 1)}
          style={{ width: 30, height: 30, borderRadius: 7, border: '1px solid #ddd', background: '#fff', fontSize: 16, cursor: 'pointer' }}>+</button>
        <span style={{ fontSize: 13, color: '#aaa' }}>seats</span>
        <span style={{ marginLeft: 'auto', fontWeight: 800, fontSize: 18 }}>${(seats * perSeat).toLocaleString()}/mo</span>
      </div>
      <div style={{ fontSize: 11, color: '#bbb', marginTop: 6 }}>Min {min} seats · ${perSeat}/seat</div>
    </div>
  );
}

/* ─── Component ─────────────────────────────────────────────────────── */
export default function Checkout() {
  const [params] = useSearchParams();
  const initialPlan = params.get('plan') || 'pro';
  const initialSeats = parseInt(params.get('seats') || '5', 10);

  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [seats, setSeats] = useState(initialSeats);
  const [showPayment, setShowPayment] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const plan = PLANS[selectedPlan] || PLANS.pro;
  const isTeamPlan = !!plan.perSeat;
  const totalPrice = isTeamPlan ? (seats * (plan.perSeat!)) : plan.price;
  const priceDisplay = plan.price === null && !isTeamPlan ? 'Free' : `$${totalPrice?.toLocaleString()}`;

  // Sync seats back to min when switching plans
  useEffect(() => {
    if (plan.minSeats) setSeats(s => Math.max(plan.minSeats!, s));
  }, [selectedPlan, plan.minSeats]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowPayment(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const checkoutUrl = [
    `https://whop.com/embed/checkout/${plan.whopId}/`,
    `?d=https://medmed.ai/checkout-success`,
    isTeamPlan ? `&quantity=${seats}` : '',
    email ? `&metadata[email]=${encodeURIComponent(email)}` : '',
    name ? `&metadata[name]=${encodeURIComponent(name)}` : '',
  ].join('');

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setShowPayment(true);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: '1px solid #ddd', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <>
      <SiteNav />
      <div style={{ minHeight: '100vh', background: '#faf7f2', paddingTop: 80 }}>
        <div style={{ maxWidth: 940, margin: '0 auto', padding: '40px 24px' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', letterSpacing: -0.5 }}>Get started with medmed.ai</h1>
            <p style={{ color: '#888', marginTop: 6, fontSize: 15 }}>Start with a 3-day free trial. No commitment required.</p>
          </div>

          {/* Plan tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
            {PLAN_ORDER.map(key => {
              const p = PLANS[key];
              const active = selectedPlan === key;
              return (
                <button key={key} onClick={() => setSelectedPlan(key)}
                  style={{
                    padding: '10px 16px', borderRadius: 10, border: active ? '2px solid #1a1a1a' : '1px solid #ddd',
                    background: active ? '#1a1a1a' : '#fff', color: active ? '#fff' : '#333',
                    cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.15s',
                  }}>
                  {p.name}
                  <span style={{ display: 'block', fontWeight: 400, fontSize: 11, opacity: 0.65, marginTop: 1 }}>{p.priceLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Two-col layout */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

            {/* Left — Plan summary */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 26, border: '1px solid #e5e0d8' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#bbb', marginBottom: 6 }}>Selected plan</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 }}>{plan.name}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', lineHeight: 1 }}>
                {plan.price === null && !isTeamPlan ? 'Free' : `$${totalPrice?.toLocaleString()}`}
                {totalPrice && <span style={{ fontSize: 13, fontWeight: 400, color: '#999' }}>/mo</span>}
              </div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 4, marginBottom: 16 }}>{plan.priceNote}</div>

              {/* Seat counter for team plans */}
              {isTeamPlan && (
                <SeatCounter
                  seats={seats}
                  min={plan.minSeats!}
                  perSeat={plan.perSeat!}
                  onChange={setSeats}
                />
              )}

              <div style={{ borderTop: '1px solid #f0ebe3', paddingTop: 16, marginTop: isTeamPlan ? 14 : 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#bbb', marginBottom: 10 }}>Included</div>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', gap: 8, marginBottom: 7, fontSize: 13, color: '#444' }}>
                    <span style={{ color: '#22c55e', fontWeight: 700 }}>✓</span>{f}
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 16, padding: '10px 12px', background: '#f8f5f0', borderRadius: 8, fontSize: 11, color: '#999' }}>
                🔒 Secure checkout · Cancel anytime · No hidden fees
              </div>
            </div>

            {/* Right — Info form */}
            <div style={{ background: '#fff', borderRadius: 16, padding: 26, border: '1px solid #e5e0d8' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 18 }}>Your information</div>
              <form onSubmit={handleContinue} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>First Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your first name" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 4 }}>Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={inputStyle} />
                </div>
                {isTeamPlan && (
                  <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#0369a1' }}>
                    👥 Your team will receive individual logins. You can add or remove seats anytime from your account.
                  </div>
                )}
                <div style={{ marginTop: 6 }}>
                  <button type="submit" disabled={!name.trim() || !email.trim()}
                    style={{
                      width: '100%', padding: '13px',
                      background: !name.trim() || !email.trim() ? '#e0e0e0' : '#1a1a1a',
                      color: !name.trim() || !email.trim() ? '#aaa' : '#fff',
                      border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700,
                      cursor: !name.trim() || !email.trim() ? 'not-allowed' : 'pointer',
                      transition: 'background 0.15s',
                    }}>
                    {plan.price === null && !isTeamPlan
                      ? 'Start Free Trial →'
                      : `Continue to Payment · ${priceDisplay}/mo →`}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', margin: 0 }}>
                  By continuing you agree to our <Link to="/terms" style={{ color: '#888' }}>Terms</Link> and <Link to="/privacy" style={{ color: '#888' }}>Privacy Policy</Link>.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Payment modal ─────────────────────────────────────────── */}
      {showPayment && (
        <div onClick={e => { if (e.target === e.currentTarget) setShowPayment(false); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}>
          <div style={{
            background: '#fff', borderRadius: 20, overflow: 'hidden',
            width: '100%', maxWidth: 480, height: 620,
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
          }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0ebe3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>medmed.ai — Secure Payment</div>
                <div style={{ fontSize: 12, color: '#999' }}>
                  {plan.name}{isTeamPlan ? ` · ${seats} seats` : ''} · {priceDisplay}/mo
                </div>
              </div>
              <button onClick={() => setShowPayment(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#999', padding: 4 }}>✕</button>
            </div>
            <iframe src={checkoutUrl} title="Secure Payment"
              style={{ flex: 1, border: 'none', width: '100%' }}
              allow="payment"
              sandbox="allow-scripts allow-same-origin allow-forms allow-top-navigation allow-popups" />
          </div>
        </div>
      )}
    </>
  );
}
