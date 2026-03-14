import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalHeader } from '@/components/GlobalHeader';
import { GlobalFooter } from '@/components/GlobalFooter';
import { toast } from 'sonner';

const WORKER = 'https://medmed-agent.hellonolen.workers.dev';

/**
 * SignUp — First Name + Email + Card (Stripe Elements)
 * Creates a Stripe customer + 3-day trial subscription before account creation.
 * Everyone must enter a card. Cancel within 3 days = no charge.
 */
const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'card' | 'done'>('info');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const inputStyle = { backgroundColor: '#f0ebe2', border: '1px solid #d8d0c0' };

  /* ── Step 1: Collect name + email ── */
  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!firstName.trim()) { setError('First name is required.'); return; }
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!agreed) { setError('Please agree to the terms to continue.'); return; }
    setStep('card');
  };

  /* ── Step 2: Create account + Stripe trial via worker ── */
  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${WORKER}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: email.trim().toLowerCase(),
          // Stripe payment method token will come from Stripe.js in production
          // For now we pass a placeholder — Stripe Elements integration attaches here
          paymentMethodId: (window as unknown as { _stripePaymentMethod?: string })._stripePaymentMethod || 'pm_placeholder',
        }),
      });

      const data = await res.json() as { success?: boolean; token?: string; error?: string };

      if (data.success && data.token) {
        localStorage.setItem('medmed_token', data.token);
        toast.success('Welcome to medmed.ai! Your 3-day trial has started.');
        navigate('/onboarding');
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#faf8f4', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <GlobalHeader />

      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mb-8">
            {(['info', 'card'] as const).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-200 ${step === s ? 'w-6 bg-primary' : i < ['info','card'].indexOf(step) ? 'w-6 bg-primary/40' : 'w-3 bg-gray-300'}`}
              />
            ))}
          </div>

          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: '#fdf9f2', border: '1px solid #e0d8cc' }}
          >
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl text-[13px] text-red-700 bg-red-50 border border-red-200">
                {error}
              </div>
            )}

            {/* ── Step 1: Info ── */}
            {step === 'info' && (
              <>
                <h1 className="text-[22px] font-bold text-gray-900 mb-1">Create your account</h1>
                <p className="text-[14px] text-gray-500 mb-7">
                  3-day trial included. Cancel anytime before it ends.
                </p>

                <form onSubmit={handleInfoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5" htmlFor="firstName">
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className="w-full px-4 py-2.5 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary, #7c3aed)')}
                      onBlur={(e) => (e.target.style.borderColor = '#d8d0c0')}
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5" htmlFor="email">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary, #7c3aed)')}
                      onBlur={(e) => (e.target.style.borderColor = '#d8d0c0')}
                    />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-primary"
                    />
                    <span className="text-[13px] text-gray-600 leading-snug">
                      I agree to the{' '}
                      <Link to="/policy" className="text-primary hover:underline">Policy Center</Link>
                      {' '}terms.
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors mt-2"
                  >
                    Continue →
                  </button>
                </form>

                <p className="text-center text-[13px] text-gray-500 mt-6">
                  Already have an account?{' '}
                  <Link to="/signin" className="text-primary hover:underline font-medium">Sign in</Link>
                </p>
              </>
            )}

            {/* ── Step 2: Card ── */}
            {step === 'card' && (
              <>
                <h2 className="text-[20px] font-bold text-gray-900 mb-1">Add your card</h2>
                <p className="text-[14px] text-gray-500 mb-2">
                  Your 3-day trial is free. If you cancel before it ends, you won't be charged.
                </p>

                {/* Trial notice */}
                <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl mb-6 text-[13px]" style={{ backgroundColor: '#ede8de' }}>
                  <svg className="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span className="text-gray-700">
                    Trial starts today for <span className="font-semibold">{email}</span>. Cancel anytime in Settings before day 3.
                  </span>
                </div>

                <form onSubmit={handleCardSubmit} className="space-y-4">
                  {/* Stripe Elements mounts here in production */}
                  <div
                    id="stripe-card-element"
                    className="w-full px-4 py-3 rounded-xl text-[14px]"
                    style={{ backgroundColor: '#f0ebe2', border: '1px solid #d8d0c0', minHeight: '44px' }}
                  >
                    {/* Stripe.js CardElement renders here */}
                    <span className="text-[13px] text-gray-400">Card number · Expiry · CVC</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Starting your trial…' : 'Start 3-day trial'}
                  </button>
                </form>

                <button onClick={() => setStep('info')} className="mt-4 text-[13px] text-gray-400 hover:text-gray-700 w-full text-center transition-colors">
                  ← Back
                </button>

                <p className="text-center text-[11px] text-gray-400 mt-5 leading-relaxed">
                  Card charged only if you stay past day 3. Cancel anytime in Settings.
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
};

export default SignUp;
