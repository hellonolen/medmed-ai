import React from 'react';
import { Link } from 'react-router-dom';
import { SiteNav } from '@/components/SiteNav';

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const Layout = ({ children, hideNav = false }: LayoutProps) => {
  return (
    <div
      className="min-h-[100dvh] flex flex-col w-full"
      style={{ backgroundColor: '#faf8f4', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {!hideNav && <SiteNav />}

      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>

      {!hideNav && (
        <footer className="border-t px-6 py-5" style={{ borderColor: '#e0d8cc', backgroundColor: '#f0ebe2' }}>
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[12px] text-gray-500">
              © {new Date().getFullYear()} MedMed.AI. For informational purposes only — not medical advice.
            </p>
            <div className="flex items-center gap-4 text-[12px] text-gray-500">
              <Link to="/policy" className="hover:text-gray-900 transition-colors">Policy Center</Link>
              <Link to="/contact" className="hover:text-gray-900 transition-colors">Support</Link>
              <Link to="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Layout;
