import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const Layout = ({ children, hideNav = false }: LayoutProps) => {
  const { user, signOut } = useAuth();

  return (
    <div
      className="min-h-[100dvh] flex flex-col w-full"
      style={{ backgroundColor: '#faf8f4', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Header */}
      {!hideNav && (
        <header
          className="border-b px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: '#f0ebe2', borderColor: '#e0d8cc' }}
        >
          <Link to="/" className="text-[16px] font-semibold text-gray-900 tracking-tight">
            MedMed.AI
          </Link>

          <nav className="flex items-center gap-1">
            {[
              { to: '/symptom-checker', label: 'Symptom Checker' },
              { to: '/pharmacy-finder', label: 'Pharmacy Finder' },
              { to: '/interaction-checker', label: 'Interaction Checker' },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="hidden md:block px-3 py-1.5 rounded-lg text-[13px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors"
              >
                {label}
              </Link>
            ))}

            <div className="w-px h-4 bg-gray-300 mx-2 hidden md:block" />

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/settings"
                  className="px-3 py-1.5 rounded-lg text-[13px] text-gray-600 hover:bg-[#e4ddd0] transition-colors"
                >
                  Settings
                </Link>
                <button
                  onClick={signOut}
                  className="px-3 py-1.5 rounded-lg text-[13px] text-gray-600 hover:bg-[#e4ddd0] transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/signin"
                  className="px-3 py-1.5 rounded-lg text-[13px] text-gray-600 hover:bg-[#e4ddd0] transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 rounded-lg text-[13px] bg-primary text-white hover:bg-primary/90 transition-colors font-medium"
                >
                  Get started
                </Link>
              </div>
            )}
          </nav>
        </header>
      )}

      {/* Content */}
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>

      {/* Footer */}
      {!hideNav && (
        <footer
          className="border-t px-6 py-5"
          style={{ borderColor: '#e0d8cc', backgroundColor: '#f0ebe2' }}
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[12px] text-gray-500">
              © {new Date().getFullYear()} MedMed.AI. Information only — not medical advice.
            </p>
            <div className="flex items-center gap-4 text-[12px] text-gray-500">
              <Link to="/policy" className="hover:text-gray-900 transition-colors">Policy Center</Link>
              <Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
              <Link to="/" className="hover:text-gray-900 transition-colors">Support</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
