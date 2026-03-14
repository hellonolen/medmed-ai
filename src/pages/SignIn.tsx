import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (result.success) {
        toast.success('Welcome back to MedMed.AI');
        navigate('/');
      } else {
        setError(result.error || 'Please check your credentials and try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#faf8f4', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Brand */}
      <Link to="/" className="text-[17px] font-semibold text-gray-900 mb-10 tracking-tight">
        MedMed.AI
      </Link>

      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ backgroundColor: '#fdf9f2', border: '1px solid #e0d8cc' }}
      >
        <h1 className="text-[22px] font-bold text-gray-900 mb-1">Welcome back</h1>
        <p className="text-[14px] text-gray-500 mb-7">Sign in to your account</p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-[13px] text-red-700 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-gray-700 mb-1.5" htmlFor="email">
              Email
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
              style={{ backgroundColor: '#f0ebe2', border: '1px solid #d8d0c0' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary, #7c3aed)')}
              onBlur={(e) => (e.target.style.borderColor = '#d8d0c0')}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[13px] font-medium text-gray-700" htmlFor="password">
                Password
              </label>
              <Link to="/reset-password" className="text-[12px] text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all"
              style={{ backgroundColor: '#f0ebe2', border: '1px solid #d8d0c0' }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary, #7c3aed)')}
              onBlur={(e) => (e.target.style.borderColor = '#d8d0c0')}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-[13px] text-gray-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-primary hover:underline font-medium">
            Create one
          </Link>
        </p>
      </div>

      <p className="text-[11px] text-gray-400 mt-6">
        <Link to="/policy" className="hover:text-gray-600">Policy Center</Link>
        {' · '}
        <Link to="/" className="hover:text-gray-600">Support</Link>
      </p>
    </div>
  );
};

export default SignIn;
