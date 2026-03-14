import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '@/components/GlobalHeader';
import { GlobalFooter } from '@/components/GlobalFooter';

/**
 * SignUp — Two steps:
 * 1. Collect First Name + Email + Terms agreement
 * 2. Redirect to Whop checkout (card entry handled securely on Whop's side)
 *
 * After Whop payment, Whop sends a webhook to the worker which creates the
 * user account in D1 and sends a magic link welcome email.
 */
const SignUp = () => {
  const [step, setStep] = useState<'info' | 'redirect'>('info');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');

  const inputStyle = { backgroundColor: '#f0ebe2', border: '1px solid #d8d0c0' };

  // We store first name + email before Whop redirect so we can pre-fill the checkout
  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!firstName.trim()) { setError('First name is required.'); return; }
    if (!email.trim())     { setError('Email is required.'); return; }
    if (!agreed)           { setError('Please agree to the terms to continue.'); return; }

    // Store locally in case Whop returns them to the site
    localStorage.setItem('medmed_pending_name', firstName.trim());
    localStorage.setItem('medmed_pending_email', email.trim().toLowerCase());

    setStep('redirect');
  };

  const handleWhopRedirect = () => {
    // WHOP_CHECKOUT_URL is set as a worker secret and also embedded at build time.
    // Until we have the real Whop product URL, we use the env-injected value.
    // Format: https://whop.com/checkout/PRODUCT_ID/?email=user@example.com&name=Jane
    const base = import.meta.env.VITE_WHOP_CHECKOUT_URL || 'https://whop.com/medmed-ai';
    const params = new URLSearchParams({
      email: email.trim().toLowerCase(),
      name: firstName.trim(),
      redirect_url: `${window.location.origin}/auth/verify`,
    });
    window.location.href = `${base}?${params.toString()}`;
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
            {(['info', 'redirect'] as const).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  step === s ? 'w-6 bg-primary' :
                  i < ['info','redirect'].indexOf(step) ? 'w-6 bg-primary/40' :
                  'w-3 bg-gray-300'
                }`}
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
                  3-day trial included. Cancel anytime before it ends — no charge.
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

            {/* ── Step 2: Whop redirect ── */}
            {step === 'redirect' && (
              <>
                <h2 className="text-[20px] font-bold text-gray-900 mb-1">Complete your purchase</h2>
                <p className="text-[14px] text-gray-500 mb-6">
                  You'll be taken to our secure checkout to enter your card. Your 3-day trial starts the moment payment is confirmed.
                </p>

                {/* Summary */}
                <div className="rounded-xl px-4 py-4 mb-6 text-[13px] space-y-1" style={{ backgroundColor: '#ede8de' }}>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name</span>
                    <span className="font-medium text-gray-800">{firstName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email</span>
                    <span className="font-medium text-gray-800">{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trial</span>
                    <span className="font-medium text-gray-800">3 days free</span>
                  </div>
                </div>

                <button
                  onClick={handleWhopRedirect}
                  className="w-full py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors"
                >
                  Go to secure checkout →
                </button>

                <button
                  onClick={() => setStep('info')}
                  className="mt-4 text-[13px] text-gray-400 hover:text-gray-700 w-full text-center transition-colors"
                >
                  ← Back
                </button>

                <p className="text-center text-[11px] text-gray-400 mt-5 leading-relaxed">
                  Payment is processed securely by Whop. Cancel anytime within 3 days — no charge.
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
