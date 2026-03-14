import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSponsor } from '@/contexts/SponsorContext';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const WORKER_URL =
  (import.meta as unknown as Record<string, any>).env?.VITE_WORKER_URL ||
  'https://medmed-agent.hellonolen.workers.dev';

const SponsorLogin = () => {
  const navigate = useNavigate();
  const { login, error, currentSponsor } = useSponsor();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (currentSponsor) navigate('/sponsor-dashboard');
  }, [currentSponsor, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast({ title: "Welcome back!", description: "Login successful" });
        navigate('/sponsor-dashboard');
      } else {
        toast({ title: "Error", description: error || "Invalid credentials", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error", description: "An unexpected error occurred", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ title: "Error", description: "Please enter your email address", variant: "destructive" });
      return;
    }
    setIsResetting(true);
    try {
      // Call real Worker reset-request endpoint
      await fetch(`${WORKER_URL}/api/auth/reset-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail, type: 'sponsor' }),
        signal: AbortSignal.timeout(10000),
      });
      // Always show success (don't leak if email exists)
      toast({ title: "Reset email sent", description: "If that email is registered, you'll receive reset instructions shortly." });
      setShowResetForm(false);
    } catch {
      toast({ title: "Reset email sent", description: "If that email is registered, you'll receive reset instructions shortly." });
      setShowResetForm(false);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col justify-center max-w-md w-full mx-auto py-12">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              {showResetForm ? "Reset Password" : "Sponsor Login"}
            </CardTitle>
            <CardDescription>
              {showResetForm
                ? "Enter your email to receive password reset instructions"
                : "Enter your credentials to access your sponsor dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {showResetForm ? (
              <form onSubmit={handleResetPassword}>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      placeholder="name@company.com"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isResetting}>
                    {isResetting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : "Send Reset Instructions"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowResetForm(false)}>
                    Back to Login
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="name@company.com"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button
                        variant="link"
                        className="px-0 text-xs"
                        type="button"
                        onClick={() => { setShowResetForm(true); setResetEmail(email); }}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in...</> : "Login"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-sm text-center text-gray-500 mt-2">
              Don't have an account?{' '}
              <Link to="/advertiser-enrollment" className="text-primary hover:underline">Get started here</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default SponsorLogin;
