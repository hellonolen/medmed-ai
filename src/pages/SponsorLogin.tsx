
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSponsor } from '@/contexts/SponsorContext';
import Layout from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const SponsorLogin = () => {
  const navigate = useNavigate();
  const { login, error, currentSponsor } = useSponsor();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
  
  return (
    <Layout>
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sponsor Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your sponsor dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
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
                  <Label htmlFor="password">Password</Label>
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
          </CardContent>
          <CardFooter className="flex flex-col">
            <p className="text-sm text-center text-gray-500 mt-2">
              Note: For demo purposes, use any email from a sponsored company with password "demo123"
            </p>
            <div className="text-sm text-center text-gray-500 mt-2">
              Example logins:
              <ul>
                <li>john@healthplus.com</li>
                <li>sarah@meditech.com</li>
                <li>david@welllife.com</li>
              </ul>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default SponsorLogin;
