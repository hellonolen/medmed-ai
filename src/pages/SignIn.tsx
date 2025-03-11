
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Mail, Lock } from 'lucide-react';

const SignIn = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, this would make an API call to authenticate the user
      // For now, we'll simulate a successful login
      setTimeout(() => {
        toast({
          title: t("signin.success", "Successfully signed in"),
          description: t("signin.welcome_back", "Welcome back to MedMed.AI"),
        });
        navigate('/user-portal');
      }, 1000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("signin.error", "Sign in failed"),
        description: t("signin.error_details", "Please check your credentials and try again"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">MedMed.AI</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex justify-center items-center py-8 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {t("signin.title", "Sign in to your account")}
            </CardTitle>
            <CardDescription className="text-center">
              {t("signin.subtitle", "Enter your email to sign in to your account")}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSignIn}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("signin.email", "Email")}</Label>
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
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">{t("signin.password", "Password")}</Label>
                  <Link to="/reset-password" className="text-xs text-primary hover:underline">
                    {t("signin.forgot", "Forgot password?")}
                  </Link>
                </div>
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
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full" />
                    {t("signin.signing_in", "Signing in...")}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <LogIn className="mr-2 h-4 w-4" />
                    {t("signin.sign_in_button", "Sign in")}
                  </div>
                )}
              </Button>
              <p className="text-center text-sm text-gray-500">
                {t("signin.no_account", "Don't have an account?")}{" "}
                <Link to="/signup" className="text-primary hover:underline">
                  {t("signin.signup_link", "Sign up")}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>

      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} MedMed.AI. {t("footer.rights", "All rights reserved.")}
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/sponsor-portal" className="text-sm text-gray-500 hover:text-primary">
                {t("footer.sponsors", "Sponsors")}
              </Link>
              <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary">
                {t("footer.privacy", "Privacy Policy")}
              </Link>
              <Link to="/terms" className="text-sm text-gray-500 hover:text-primary">
                {t("footer.terms", "Terms of Service")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignIn;
