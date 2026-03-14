import { Link } from "react-router-dom";

/**
 * GlobalFooter — consistent footer used across all public-facing pages.
 * Copyright left · links right (Policy Center · Support · Contact)
 */
export function GlobalFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="border-t px-6 py-5"
      style={{ borderColor: "#e0d8cc", backgroundColor: "#f0ebe2" }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Copyright */}
        <p className="text-[12px] text-gray-500">
          © {year} medmed.ai. For informational purposes only — not medical advice.
        </p>

        {/* Links */}
        <div className="flex items-center gap-4 text-[12px] text-gray-500">
          <Link to="/policy"   className="hover:text-gray-900 transition-colors">Policy Center</Link>
          <Link to="/chat"     className="hover:text-gray-900 transition-colors">Support</Link>
          <Link to="/contact"  className="hover:text-gray-900 transition-colors">Contact</Link>
        </div>
      </div>
    </footer>
  );
}
