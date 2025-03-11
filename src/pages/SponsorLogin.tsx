
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSponsor } from '@/contexts/SponsorContext';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';

const SponsorLogin = () => {
  const navigate = useNavigate();
  const { login, resetPassword, error, currentSponsor } = useSponsor();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  
  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (currentSponsor) {
      navigate('/sponsor-dashboard');
    }
  }, [currentSponsor, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Success",
          description: "Login successful",
        });
        navigate('/sponsor-dashboard');
      } else {
        toast({
          title: "Error",
          description: error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }
    
    setIsResetting(true);
    
    try {
      const success = await resetPassword(resetEmail);
      
      if (success) {
        toast({
          title: "Success",
          description: "Password reset instructions have been sent to your email",
        });
        setShowResetForm(false);
      } else {
        toast({
          title: "Error",
          description: error || "Email not found",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-md mx-auto py-12">
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
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={isResetting}>
                    {isResetting ? "Sending..." : "Send Reset Instructions"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowResetForm(false)}
                  >
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
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button 
                        variant="link" 
                        className="px-0 text-xs" 
                        onClick={(e) => {
                          e.preventDefault();
                          setShowResetForm(true);
                          setResetEmail(email); // Pre-fill email if they've entered it
                        }}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="flex items-center justify-center w-full p-3 mb-2 bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
              <p className="text-sm text-amber-600">
                {showResetForm 
                  ? "Note: For this demo, password reset is simulated" 
                  : "Note: For demo purposes, use any email from a sponsored company with password \"demo123\""}
              </p>
            </div>
            {!showResetForm && (
              <div className="text-sm text-center text-gray-500 mt-2">
                Example logins:
                <ul>
                  <li>john@healthplus.com</li>
                  <li>sarah@meditech.com</li>
                  <li>david@welllife.com</li>
                </ul>
              </div>
            )}
            <p className="text-sm text-center text-gray-500 mt-4">
              Don't have an account? <a href="/advertiser-enrollment" className="text-primary hover:underline">Sign up here</a>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default SponsorLogin;
