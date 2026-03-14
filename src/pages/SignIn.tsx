import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlobalHeader } from '@/components/GlobalHeader';
import { GlobalFooter } from '@/components/GlobalFooter';

const WORKER = 'https://medmed-agent.hellonolen.workers.dev';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${WORKER}/api/auth/magic-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error || 'Could not send link. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#f0ebe2',
    border: '1px solid #d8d0c0',
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#faf8f4', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <GlobalHeader />

      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div
            className="rounded-2xl p-8"
            style={{ backgroundColor: '#fdf9f2', border: '1px solid #e0d8cc' }}
          >
            {!sent ? (
              <>
                <h1 className="text-[22px] font-bold text-gray-900 mb-1">Welcome back</h1>
                <p className="text-[14px] text-gray-500 mb-7">
                  Enter your email and we'll send you a sign-in link.
                </p>

                {error && (
                  <div className="mb-5 px-4 py-3 rounded-xl text-[13px] text-red-700 bg-red-50 border border-red-200">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSend} className="space-y-4">
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

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2"
                  >
                    {isLoading ? 'Sending…' : 'Send sign-in link'}
                  </button>
                </form>

                <p className="text-center text-[13px] text-gray-500 mt-6">
                  Don't have an account?{' '}
                  <Link to="/pricing" className="text-primary hover:underline font-medium">
                    Get started
                  </Link>
                </p>
              </>
            ) : (
              /* ── Sent state ── */
              <div className="text-center py-4">
                <div className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: '#ede8de' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.75" strokeLinecap="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h2 className="text-[18px] font-bold text-gray-900 mb-2">Check your email</h2>
                <p className="text-[14px] text-gray-500 leading-relaxed">
                  We sent a sign-in link to <span className="font-medium text-gray-700">{email}</span>.
                  The link expires in 15 minutes.
                </p>
                <button
                  onClick={() => { setSent(false); setEmail(''); }}
                  className="mt-6 text-[13px] text-primary hover:underline"
                >
                  Use a different email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
};

export default SignIn;
