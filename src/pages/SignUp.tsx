import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SignUp = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const inputStyle = {
    backgroundColor: '#f0ebe2',
    border: '1px solid #d8d0c0',
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!agreed) {
      setError('Please agree to the terms to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signUp(email, password, name);
      if (result.success) {
        toast.success('Welcome to MedMed.AI!');
        navigate('/');
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const Field = ({
    id, label, type, value, onChange, placeholder, autoComplete,
  }: {
    id: string; label: string; type: string; value: string;
    onChange: (v: string) => void; placeholder: string; autoComplete?: string;
  }) => (
    <div>
      <label className="block text-[13px] font-medium text-gray-700 mb-1.5" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all"
        style={inputStyle}
        onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary, #7c3aed)')}
        onBlur={(e) => (e.target.style.borderColor = '#d8d0c0')}
      />
    </div>
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#faf8f4', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <Link to="/" className="text-[17px] font-semibold text-gray-900 mb-10 tracking-tight">
        MedMed.AI
      </Link>

      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ backgroundColor: '#fdf9f2', border: '1px solid #e0d8cc' }}
      >
        <h1 className="text-[22px] font-bold text-gray-900 mb-1">Create your account</h1>
        <p className="text-[14px] text-gray-500 mb-7">Free to start. Upgrade anytime.</p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl text-[13px] text-red-700 bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="space-y-4">
          <Field id="name" label="Full name" type="text" value={name} onChange={setName} placeholder="Jane Smith" autoComplete="name" />
          <Field id="email" label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
          <Field id="password" label="Password" type="password" value={password} onChange={setPassword} placeholder="Min. 8 characters" autoComplete="new-password" />
          <Field id="confirmPassword" label="Confirm password" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" autoComplete="new-password" />

          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-primary"
            />
            <span className="text-[13px] text-gray-600 leading-snug">
              I agree to the{' '}
              <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-[13px] text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/signin" className="text-primary hover:underline font-medium">
            Sign in
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

export default SignUp;
