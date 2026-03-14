import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "FAQ", href: "/faq" },
  { label: "Pricing", href: "/pricing" },
];

/**
 * GlobalHeader — sticky top bar used across all public-facing pages.
 * Logo left · nav links right · CTAs far right · mobile hamburger.
 */
export function GlobalHeader() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const linkCls = (href: string) =>
    `text-[13.5px] transition-colors ${
      pathname === href ? "text-gray-900 font-semibold" : "text-gray-500 hover:text-gray-900"
    }`;

  return (
    <header
      className="px-6 py-4 flex items-center justify-between border-b sticky top-0 z-40"
      style={{ backgroundColor: "#faf8f4", borderColor: "#e0d8cc" }}
    >
      {/* Logo — always lowercase */}
      <Link to="/" className="text-[17px] font-bold text-gray-900 tracking-tight flex-shrink-0">
        medmed.ai
      </Link>

      {/* Desktop nav — justified to the right via ml-auto */}
      <nav className="hidden md:flex items-center gap-7 ml-auto mr-6">
        {NAV_LINKS.map(({ label, href }) => (
          <Link key={label} to={href} className={linkCls(href)}>{label}</Link>
        ))}
      </nav>

      {/* Desktop CTAs — far right */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
        {user ? (
          <Link
            to="/chat"
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            Open chat
          </Link>
        ) : (
          <>
            <Link
              to="/signin"
              className="px-4 py-2 rounded-xl text-[13px] text-gray-600 hover:bg-[#e4ddd0] transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/pricing"
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
          </>
        )}
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-[#e4ddd0] transition-colors"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <span className={`block h-0.5 w-5 bg-gray-700 transition-transform duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`block h-0.5 w-5 bg-gray-700 transition-opacity duration-200 ${menuOpen ? "opacity-0" : ""}`} />
        <span className={`block h-0.5 w-5 bg-gray-700 transition-transform duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 border-b px-6 py-5 flex flex-col gap-4 md:hidden"
          style={{ backgroundColor: "#faf8f4", borderColor: "#e0d8cc" }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              to={href}
              className="text-[15px] text-gray-700 font-medium hover:text-gray-900 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
          <div className="h-px" style={{ backgroundColor: "#e0d8cc" }} />
          {user ? (
            <Link to="/chat" onClick={() => setMenuOpen(false)} className="py-3 rounded-xl text-center text-[14px] font-semibold text-white bg-primary">
              Open chat
            </Link>
          ) : (
            <div className="flex flex-col gap-2">
              <Link to="/signin" onClick={() => setMenuOpen(false)} className="py-3 rounded-xl text-center text-[14px] text-gray-700 font-medium" style={{ border: "1px solid #d8d0c0" }}>
                Sign in
              </Link>
              <Link to="/pricing" onClick={() => setMenuOpen(false)} className="py-3 rounded-xl text-center text-[14px] font-semibold text-white bg-primary">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
