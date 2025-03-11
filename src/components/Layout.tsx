
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Home, Settings, HelpCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">MedMed.AI</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-1" />
                {t("nav.settings", "Settings")}
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-1" />
                {t("nav.home", "Home")}
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
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
              <Button variant="link" size="sm" className="text-sm text-gray-500 hover:text-primary p-0">
                <HelpCircle className="h-4 w-4 mr-1" />
                {t("footer.help", "Help")}
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
