import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle2, Loader2, Lock } from 'lucide-react';

const WORKER_URL =
  (import.meta as any).env?.VITE_WORKER_URL ||
  'https://medmed-agent.hellonolen.workers.dev';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [token, setToken] = useState('');
  const [type, setType] = useState<'user' | 'sponsor'>('user');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenState, setTokenState] = useState<'loading' | 'valid' | 'invalid'>('loading');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get('token');
    const typeParam = params.get('type') as 'user' | 'sponsor';
    if (t) {
      setToken(t);
      setType(typeParam || 'user');
      setTokenState('valid');
    } else {
      setTokenState('invalid');
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (password.length < 8) {
      toast({ title: 'Error', description: 'Password must be at least 8 characters', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`${WORKER_URL}/api/auth/reset-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, type }),
        signal: AbortSignal.timeout(15000),
      });
      const data: any = await res.json();

      if (res.ok && data.success) {
        setIsSuccess(true);
        toast({ title: 'Password updated', description: 'You can now sign in with your new password.' });
        setTimeout(() => navigate(type === 'sponsor' ? '/sponsor-login' : '/signin'), 2500);
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to update password', variant: 'destructive' });
        if (data.error?.includes('expired') || data.error?.includes('Invalid')) {
          setTokenState('invalid');
        }
      }
    } catch {
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (tokenState === 'loading') {
    return (
      <Layout hideNav>
        <div className="flex-1 flex justify-center items-center py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-gray-500">Validating your reset link...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (tokenState === 'invalid') {
    return (
      <Layout hideNav>
        <div className="flex-1 flex justify-center items-center py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center">Invalid Reset Link</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-red-500" />
              <p className="text-center text-gray-600">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button className="flex-1" onClick={() => navigate(type === 'sponsor' ? '/sponsor-login' : '/signin')}>
                Back to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isSuccess) {
    return (
      <Layout hideNav>
        <div className="flex-1 flex justify-center items-center py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <h2 className="text-xl font-semibold">Password Updated!</h2>
              <p className="text-gray-500 text-center">Redirecting you to sign in...</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideNav>
      <div className="flex-1 flex justify-center items-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Reset Your Password</CardTitle>
            <CardDescription className="text-center">Enter your new password below</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</>
                ) : (
                  'Update Password'
                )}
              </Button>
              <Link
                to={type === 'sponsor' ? '/sponsor-login' : '/signin'}
                className="text-sm text-center text-primary hover:underline"
              >
                Back to Login
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default ResetPassword;
