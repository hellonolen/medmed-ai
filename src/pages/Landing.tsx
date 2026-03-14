import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

/* ─── Product Preview (inline SVG mock of the chat UI) ── */
function ProductPreview() {
  return (
    <div
      className="w-full h-full rounded-2xl overflow-hidden border shadow-2xl"
      style={{ backgroundColor: "#fdf9f2", borderColor: "#e0d8cc" }}
    >
      {/* Mock sidebar + chat */}
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-[180px] flex-shrink-0 border-r flex flex-col" style={{ backgroundColor: "#f0ebe2", borderColor: "#e0d8cc" }}>
          <div className="px-4 py-4 border-b" style={{ borderColor: "#e0d8cc" }}>
            <span className="text-[13px] font-bold text-gray-800">MedMed.AI</span>
          </div>
          <div className="px-3 pt-3 space-y-1">
            <div className="px-3 py-2 rounded-xl text-[11px] text-gray-700" style={{ backgroundColor: "#e4ddd0" }}>+ New conversation</div>
          </div>
          <div className="px-3 pt-4 space-y-1">
            <p className="text-[8px] uppercase tracking-widest text-gray-400 px-2 mb-1">Tools</p>
            {["Symptom Checker", "Pharmacy Finder", "Interaction Checker"].map((t) => (
              <div key={t} className="px-3 py-1.5 rounded-lg text-[10px] text-gray-600">{t}</div>
            ))}
          </div>
          <div className="mt-auto px-3 py-3 border-t" style={{ borderColor: "#d8d0c0" }}>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-[9px] font-bold">J</div>
              <div>
                <p className="text-[9px] font-medium text-gray-800">Jane</p>
                <p className="text-[8px] text-gray-500">Free plan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 px-6 py-6 space-y-5 overflow-hidden">
            {/* User message */}
            <div className="flex justify-end">
              <div className="max-w-[70%] px-4 py-2.5 rounded-2xl rounded-br-sm text-[11px] text-gray-900 leading-relaxed" style={{ backgroundColor: "#ede8de" }}>
                What medications interact with lisinopril?
              </div>
            </div>
            {/* AI response */}
            <div className="max-w-[85%] text-[10px] text-gray-700 leading-relaxed space-y-1.5">
              <p className="font-semibold text-gray-800 text-[11px]">Lisinopril interactions to know:</p>
              <p>· <strong>NSAIDs</strong> (ibuprofen, naproxen) — may reduce effectiveness and increase kidney risk</p>
              <p>· <strong>Potassium supplements</strong> — combined use may cause dangerous potassium levels</p>
              <p>· <strong>Diuretics</strong> — may cause excessive blood pressure drop</p>
              <p className="text-gray-400 text-[9px] mt-2 italic">Always consult your doctor before changing medications.</p>
            </div>
            {/* Second user message */}
            <div className="flex justify-end">
              <div className="max-w-[70%] px-4 py-2.5 rounded-2xl rounded-br-sm text-[11px] text-gray-900 leading-relaxed" style={{ backgroundColor: "#ede8de" }}>
                What about with metformin?
              </div>
            </div>
            {/* Typing indicator */}
            <div className="flex gap-1 items-center">
              {[0, 120, 240].map((d) => (
                <span key={d} className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
          {/* Input bar */}
          <div className="px-4 pb-4">
            <div className="rounded-xl border px-4 py-2.5 flex items-center gap-3" style={{ backgroundColor: "#f0ebe2", borderColor: "#d8d0c0" }}>
              <span className="text-gray-400 text-[13px] font-light">+</span>
              <span className="text-[10px] text-gray-400 flex-1">Ask anything about medications...</span>
              <div className="h-6 w-6 rounded-lg bg-primary flex items-center justify-center text-white text-[10px]">↑</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Landing Page ────────────────────────────────────── */
export default function Landing() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      navigate(`/signup?email=${encodeURIComponent(email)}`);
    } else {
      navigate("/signup");
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Nav */}
      <header className="px-8 py-5 flex items-center justify-between flex-shrink-0">
        <span className="text-[17px] font-bold text-gray-900 tracking-tight">MedMed.AI</span>
        <nav className="hidden md:flex items-center gap-1">
          {["Features", "Pricing"].map((label) => (
            <Link
              key={label}
              to={label === "Pricing" ? "/pricing" : "/"}
              className="px-4 py-1.5 rounded-lg text-[13.5px] text-gray-600 hover:text-gray-900 hover:bg-[#e8e1d5] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/signin"
            className="hidden sm:block px-4 py-2 rounded-xl text-[13px] text-gray-600 hover:bg-[#e4ddd0] transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-12">

          {/* Left: copy + CTA */}
          <div>
            <h1
              className="text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-5"
              style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
            >
              Healthcare answers,<br />instantly.
            </h1>
            <p className="text-[17px] text-gray-500 mb-10 leading-relaxed max-w-md">
              Search medications, check interactions, find pharmacies, and understand your symptoms — all in one place.
            </p>

            {/* CTA form */}
            <form onSubmit={handleContinue} className="max-w-sm space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3.5 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all"
                style={{ backgroundColor: "#fdf9f2", border: "2px solid #e0d8cc" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-primary, #7c3aed)")}
                onBlur={(e) => (e.target.style.borderColor = "#e0d8cc")}
              />
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors"
              >
                Continue with email
              </button>
            </form>

            <p className="text-[12px] text-gray-400 mt-4 max-w-sm">
              Free to start. No credit card required.{" "}
              <Link to="/policy" className="underline hover:text-gray-600">Privacy Policy</Link>.
            </p>
          </div>

          {/* Right: product preview */}
          <div className="hidden lg:block h-[520px] relative">
            {/* Subtle grid background */}
            <div
              className="absolute inset-0 rounded-3xl opacity-40"
              style={{
                backgroundImage: "linear-gradient(#e0d8cc 1px, transparent 1px), linear-gradient(90deg, #e0d8cc 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative h-full p-4">
              <ProductPreview />
            </div>
          </div>
        </div>
      </main>

      {/* Subtle footer */}
      <footer className="px-8 py-5 flex items-center justify-between border-t text-[12px] text-gray-400" style={{ borderColor: "#e0d8cc" }}>
        <span>© {new Date().getFullYear()} MedMed.AI</span>
        <div className="flex gap-4">
          <Link to="/policy" className="hover:text-gray-700 transition-colors">Policy Center</Link>
          <Link to="/pricing" className="hover:text-gray-700 transition-colors">Pricing</Link>
          <Link to="/" className="hover:text-gray-700 transition-colors">Support</Link>
        </div>
      </footer>
    </div>
  );
}
