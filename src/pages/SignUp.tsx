
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import Layout from '@/components/Layout';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';

const SignUp = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: t('signup.password_mismatch', "Passwords don't match"),
        description: t('signup.password_mismatch_description', 'Please make sure both passwords match'),
      });
      return;
    }

    if (!agreeToTerms) {
      toast({
        variant: 'destructive',
        title: t('signup.terms_required', 'Terms agreement required'),
        description: t('signup.terms_required_description', 'You must agree to the terms and conditions'),
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signUp(email, password, name);
      if (result.success) {
        toast({
          title: t('signup.success', 'Registration successful'),
          description: t('signup.welcome', 'Welcome to MedMed.AI! Your account has been created.'),
        });
        navigate('/user-portal');
      } else {
        toast({
          variant: 'destructive',
          title: t('signup.error', 'Registration failed'),
          description: result.error || t('signup.error_details', 'An error occurred during registration. Please try again.'),
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: t('signup.error', 'Registration failed'),
        description: t('signup.error_details', 'An error occurred during registration. Please try again.'),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout hideNav>
      <div className="flex-1 flex justify-center items-center py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {t('signup.title', 'Create an account')}
            </CardTitle>
            <CardDescription className="text-center">
              {t('signup.subtitle', 'Enter your information to create an account')}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSignUp}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('signup.name', 'Name')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('signup.email', 'Email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('signup.password', 'Password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('signup.confirm_password', 'Confirm Password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => {
                    setAgreeToTerms(checked as boolean);
                  }}
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('signup.agree_terms', 'I agree to the')}{' '}
                  <Link to="/terms" className="text-primary hover:underline">
                    {t('signup.terms_link', 'terms and conditions')}
                  </Link>
                </label>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                    {t('signup.creating_account', 'Creating account...')}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <UserPlus className="mr-2 h-4 w-4" />
                    {t('signup.sign_up_button', 'Sign up')}
                  </div>
                )}
              </Button>
              <p className="text-center text-sm text-gray-500">
                {t('signup.have_account', 'Already have an account?')}{' '}
                <Link to="/signin" className="text-primary hover:underline">
                  {t('signup.signin_link', 'Sign in')}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default SignUp;
