import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalHeader } from '@/components/GlobalHeader';

const WORKER = 'https://medmed-agent.hellonolen.workers.dev';

/**
 * /auth/verify — handles magic link token verification.
 * Reads ?token= from URL, calls worker, stores JWT, redirects to /chat.
 */
export default function AuthVerify() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verifying your link…');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus('error');
      setMessage('No token found in link. Please request a new sign-in link.');
      return;
    }

    fetch(`${WORKER}/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then((data: { success?: boolean; token?: string; user?: { name?: string }; error?: string }) => {
        if (data.success && data.token) {
          localStorage.setItem('medmed_token', data.token);
          setStatus('success');
          setMessage(`Welcome back${data.user?.name ? `, ${data.user.name.split(' ')[0]}` : ''}!`);
          setTimeout(() => navigate('/chat', { replace: true }), 800);
        } else {
          setStatus('error');
          setMessage(data.error || 'This link is invalid or has expired. Please request a new one.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [navigate]);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: '#faf8f4', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <GlobalHeader />

      <div className="flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-sm text-center py-12 px-8 rounded-2xl" style={{ backgroundColor: '#fdf9f2', border: '1px solid #e0d8cc' }}>
          {status === 'verifying' && (
            <>
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-5" />
              <p className="text-[15px] text-gray-600">{message}</p>
            </>
          )}
          {status === 'success' && (
            <>
              <p className="text-[20px] font-bold text-gray-900 mb-2">{message}</p>
              <p className="text-[14px] text-gray-500">Taking you to your chat…</p>
            </>
          )}
          {status === 'error' && (
            <>
              <p className="text-[16px] font-bold text-gray-900 mb-3">Link expired or invalid</p>
              <p className="text-[14px] text-gray-500 mb-6">{message}</p>
              <a
                href="/signin"
                className="inline-block px-6 py-2.5 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors"
              >
                Get a new link
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
