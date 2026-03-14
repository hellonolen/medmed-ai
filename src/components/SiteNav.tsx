import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function SiteNav() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  const active = (p: string) =>
    pathname === p ? "text-gray-900 font-semibold" : "text-gray-500 hover:text-gray-900";

  return (
    <header
      className="px-8 py-4 flex items-center justify-between border-b sticky top-0 z-40"
      style={{ backgroundColor: "#faf8f4", borderColor: "#e0d8cc" }}
    >
      {/* Logo */}
      <Link to="/" className="text-[17px] font-bold text-gray-900 tracking-tight">
        MedMed.AI
      </Link>

      {/* Center nav */}
      <nav className="hidden md:flex items-center gap-6">
        <Link to="/pricing" className={`text-[13.5px] transition-colors ${active("/pricing")}`}>
          Pricing
        </Link>
        <Link to="/policy" className={`text-[13.5px] transition-colors ${active("/policy")}`}>
          Policy Center
        </Link>
      </nav>

      {/* Right CTA */}
      <div className="flex items-center gap-2">
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
              Get started
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
