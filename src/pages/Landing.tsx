import { Link } from "react-router-dom";
import { SiteNav } from "@/components/SiteNav";

/* ─── Inline product preview (used in hero) ── */
function ProductPreview() {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden border shadow-2xl" style={{ backgroundColor: "#fdf9f2", borderColor: "#e0d8cc" }}>
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-[160px] flex-shrink-0 border-r flex flex-col" style={{ backgroundColor: "#f0ebe2", borderColor: "#e0d8cc" }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: "#e0d8cc" }}>
            <span className="text-[12px] font-bold text-gray-800">MedMed.AI</span>
          </div>
          <div className="px-3 pt-3 space-y-1">
            <div className="px-3 py-1.5 rounded-xl text-[10px] text-gray-700" style={{ backgroundColor: "#e4ddd0" }}>+ New conversation</div>
          </div>
          <div className="px-3 pt-4 space-y-0.5">
            <p className="text-[8px] uppercase tracking-widest text-gray-400 px-2 mb-1">Tools</p>
            {["Symptom Checker", "Pharmacy Finder", "Interaction Checker"].map((t) => (
              <div key={t} className="px-3 py-1.5 rounded-lg text-[9px] text-gray-600">{t}</div>
            ))}
          </div>
          <div className="mt-auto px-3 py-3 border-t" style={{ borderColor: "#d8d0c0" }}>
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full bg-gray-700 flex items-center justify-center text-white text-[8px] font-bold">J</div>
              <div>
                <p className="text-[8px] font-medium text-gray-800">Jane</p>
                <p className="text-[7px] text-gray-500">Pro plan</p>
              </div>
            </div>
          </div>
        </div>
        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 px-5 py-5 space-y-4 overflow-hidden">
            <div className="flex justify-end">
              <div className="max-w-[70%] px-3 py-2 rounded-2xl rounded-br-sm text-[10px] text-gray-900 leading-relaxed" style={{ backgroundColor: "#ede8de" }}>
                What medications interact with lisinopril?
              </div>
            </div>
            <div className="max-w-[85%] text-[9px] text-gray-700 leading-relaxed space-y-1">
              <p className="font-semibold text-gray-800 text-[10px]">Lisinopril interactions to know:</p>
              <p>· <strong>NSAIDs</strong> — may reduce effectiveness and increase kidney risk</p>
              <p>· <strong>Potassium supplements</strong> — may cause dangerous potassium levels</p>
              <p>· <strong>Diuretics</strong> — may cause excessive blood pressure drop</p>
              <p className="text-gray-400 text-[8px] mt-1 italic">Always consult your doctor before changing medications.</p>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[70%] px-3 py-2 rounded-2xl rounded-br-sm text-[10px] text-gray-900" style={{ backgroundColor: "#ede8de" }}>
                What about with metformin?
              </div>
            </div>
            <div className="flex gap-1 items-center">
              {[0, 120, 240].map((d) => (
                <span key={d} className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
          <div className="px-4 pb-4">
            <div className="rounded-xl border px-3 py-2 flex items-center gap-2" style={{ backgroundColor: "#f0ebe2", borderColor: "#d8d0c0" }}>
              <span className="text-gray-400 text-[12px]">+</span>
              <span className="text-[9px] text-gray-400 flex-1">Ask anything about medications...</span>
              <div className="h-5 w-5 rounded-lg bg-primary flex items-center justify-center text-white text-[9px]">↑</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Section wrapper ──────────────────────── */
function Section({ children, tinted = false }: { children: React.ReactNode; tinted?: boolean }) {
  return (
    <section style={{ backgroundColor: tinted ? "#f0ebe2" : "#faf8f4" }} className="py-20 px-6">
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  );
}

/* ─── Feature row ──────────────────────────── */
function FeatureRow({ title, body, screen, flip = false }: { title: string; body: string; screen: string; flip?: boolean }) {
  const img = (
    <div className="rounded-2xl overflow-hidden border shadow-xl" style={{ borderColor: "#e0d8cc" }}>
      <img src={screen} alt={title} className="w-full h-auto block" style={{ maxHeight: 420, objectFit: "cover", objectPosition: "top" }} />
    </div>
  );
  const copy = (
    <div className="flex flex-col justify-center">
      <h3 className="text-[28px] font-bold text-gray-900 mb-4 leading-tight tracking-tight">{title}</h3>
      <p className="text-[16px] text-gray-500 leading-relaxed">{body}</p>
    </div>
  );
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${flip ? "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1" : ""}`}>
      {img}
      {copy}
    </div>
  );
}

/* ─── Landing page ─────────────────────────── */
export default function Landing() {
  const card = { backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      {/* ── HERO ── */}
      <section className="py-16 px-6" style={{ backgroundColor: "#faf8f4" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] text-gray-600 mb-6" style={{ backgroundColor: "#ede8de" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Now available for everyone
            </div>
            <h1 className="text-5xl lg:text-[58px] font-bold text-gray-900 leading-[1.1] tracking-tight mb-5">
              Healthcare answers,<br />instantly.
            </h1>
            <p className="text-[17px] text-gray-500 mb-10 leading-relaxed max-w-md">
              Search medications, check drug interactions, find pharmacies, and understand your symptoms — all in one place. No appointments. No waiting.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/pricing" className="px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-[15px] hover:bg-primary/90 transition-colors">
                Get started free
              </Link>
              <Link to="/pricing" className="px-8 py-3.5 rounded-xl font-semibold text-[15px] text-gray-700 hover:bg-[#e4ddd0] transition-colors" style={{ border: "1px solid #d8d0c0" }}>
                See pricing
              </Link>
            </div>
            <p className="text-[12px] text-gray-400 mt-5">
              Free plan available. No credit card required.
            </p>
          </div>
          {/* Hero screen */}
          <div className="hidden lg:block h-[500px] relative">
            <div className="absolute inset-0 rounded-3xl opacity-30"
              style={{ backgroundImage: "linear-gradient(#e0d8cc 1px, transparent 1px), linear-gradient(90deg, #e0d8cc 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative h-full p-4">
              <ProductPreview />
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAR ── */}
      <div className="border-y py-5 px-6" style={{ borderColor: "#e0d8cc", backgroundColor: "#f0ebe2" }}>
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-8 text-[13px] text-gray-500">
          {["FDA drug database integrated", "Real-time pharmacy data", "Drug interaction checker", "HIPAA-aware design", "No ads. No data selling."].map((f) => (
            <span key={f} className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="7" fill="#d4c9b8" /><path d="M3.5 7l2.5 2.5 4.5-4.5" stroke="#4a4035" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <Section>
        <div className="text-center mb-14">
          <h2 className="text-[36px] font-bold text-gray-900 tracking-tight mb-3">How it works</h2>
          <p className="text-[16px] text-gray-500 max-w-lg mx-auto">Three steps to better health information.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { n: "1", title: "Ask your question", body: "Type anything into the chat — about a medication, symptom, drug interaction, or pharmacy near you. Use the + menu to activate a specialized mode." },
            { n: "2", title: "Get clear answers", body: "Receive structured, easy-to-understand information instantly. Pro members can take a live photo or record video for visual analysis by our system." },
            { n: "3", title: "Take informed action", body: "Use what you learned to have better conversations with your doctor or pharmacist. MedMed.AI is your health research companion, not a replacement for care." },
          ].map(({ n, title, body }) => (
            <div key={n} className="rounded-2xl p-7" style={card}>
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <span className="text-[16px] font-bold text-primary">{n}</span>
              </div>
              <h3 className="text-[17px] font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-[14px] text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── FEATURE: CHAT INTERFACE ── */}
      <Section tinted>
        <FeatureRow
          title="Ask anything. Get answers instantly."
          body="The MedMed.AI chat interface works like a conversation. Ask about any medication by name, describe a symptom, or ask about a drug combination — and get a clear, detailed response in seconds. Your conversation history is saved so you can reference it anytime."
          screen="/screens/chat.png"
        />
      </Section>

      {/* ── FEATURE: SYMPTOM CHECKER ── */}
      <Section>
        <FeatureRow
          flip
          title="Check symptoms before your appointment."
          body="The Symptom Checker helps you understand what might be going on before you see a doctor. Select your symptoms, answer a few questions, and get educational information about possible conditions — so you walk into every appointment informed."
          screen="/screens/symptom-checker.png"
        />
      </Section>

      {/* ── FEATURE: PRO CAMERA/VIDEO ── */}
      <Section tinted>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Visual indicator — no external image, CSS card */}
          <div className="rounded-2xl p-10 flex flex-col items-center justify-center gap-5 border shadow-inner" style={{ backgroundColor: "#fdf9f2", borderColor: "#e0d8cc", minHeight: 300 }}>
            <div className="flex gap-6">
              {[
                { icon: "📷", label: "Live Camera" },
                { icon: "🎥", label: "45s Video" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-[30px]" style={{ backgroundColor: "#ede8de" }}>{icon}</div>
                  <span className="text-[12px] font-semibold text-gray-600">{label}</span>
                  <span className="text-[10px] text-primary font-medium">Pro only</span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-gray-400 text-center max-w-xs mt-2">Take a live photo or record up to 45 seconds. Analyzed in real time.</p>
          </div>
          <div className="flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold text-primary mb-4" style={{ backgroundColor: "#ede8de" }}>Pro feature</div>
            <h3 className="text-[28px] font-bold text-gray-900 mb-4 leading-tight tracking-tight">See it. Understand it.</h3>
            <p className="text-[16px] text-gray-500 leading-relaxed">
              Pro members can use their device camera to take a live photo of a visible concern — a rash, an eye issue, a wound — or record a short video. Our system analyzes what it observes and provides detailed educational context. No image uploads from your camera roll; live capture only.
            </p>
            <Link to="/pricing" className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-[14px] hover:bg-primary/90 transition-colors w-fit">
              Upgrade to Pro →
            </Link>
          </div>
        </div>
      </Section>

      {/* ── TOOLS GRID ── */}
      <Section>
        <div className="text-center mb-14">
          <h2 className="text-[36px] font-bold text-gray-900 tracking-tight mb-3">Everything you need in one place</h2>
          <p className="text-[16px] text-gray-500 max-w-lg mx-auto">Specialized tools accessible right inside the chat.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { title: "Symptom Checker", desc: "Describe what you're feeling. Get educational context on possible conditions before you see a doctor.", emoji: "🩺" },
            { title: "Pharmacy Finder", desc: "Find pharmacies near you, check hours, compare medication pricing, and confirm stock availability.", emoji: "🏥" },
            { title: "Interaction Checker", desc: "List your medications and see known interactions, their severity levels, and what precautions to take.", emoji: "💊" },
            { title: "Medication Database", desc: "Search any medication by name for dosing information, side effects, contraindications, and more.", emoji: "📋" },
            { title: "Live Camera Analysis", desc: "Pro: Take a live photo of a visible health concern for detailed visual analysis and educational context.", emoji: "📷" },
            { title: "Video Analysis", desc: "Pro: Record up to 45 seconds for a comprehensive visual health observation. Audio included.", emoji: "🎥" },
          ].map(({ title, desc, emoji }) => (
            <div key={title} className="rounded-2xl p-6" style={card}>
              <div className="text-[28px] mb-4">{emoji}</div>
              <h3 className="text-[15px] font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-[13px] text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── PRICING PREVIEW ── */}
      <Section tinted>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col justify-center">
            <h2 className="text-[36px] font-bold text-gray-900 tracking-tight mb-4">Simple, honest pricing.</h2>
            <p className="text-[16px] text-gray-500 leading-relaxed mb-6">
              Start free and see the value before you commit. Upgrade to Pro for unlimited access, camera analysis, video analysis, and saved conversation history.
            </p>
            <div className="space-y-3 mb-8">
              {[
                { tier: "Free", price: "$0", note: "5 questions per session, all tools accessible" },
                { tier: "Pro", price: "$20/mo", note: "Unlimited questions, camera, video, history" },
                { tier: "Max", price: "$100/mo", note: "5× usage, priority access, early features" },
              ].map(({ tier, price, note }) => (
                <div key={tier} className="flex items-start gap-4 p-4 rounded-xl" style={card}>
                  <div className="flex-shrink-0">
                    <span className="text-[13px] font-bold text-gray-900">{tier}</span>
                    <span className="text-[13px] text-gray-400 ml-2">{price}</span>
                  </div>
                  <span className="text-[13px] text-gray-500">{note}</span>
                </div>
              ))}
            </div>
            <Link to="/pricing" className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-white font-semibold text-[15px] hover:bg-primary/90 transition-colors w-fit">
              View full pricing →
            </Link>
          </div>
          <div className="rounded-2xl overflow-hidden border shadow-xl" style={{ borderColor: "#e0d8cc" }}>
            <img src="/screens/pricing.png" alt="Pricing page" className="w-full h-auto block" style={{ maxHeight: 420, objectFit: "cover", objectPosition: "top" }} />
          </div>
        </div>
      </Section>

      {/* ── CTA ── */}
      <section className="py-20 px-6" style={{ backgroundColor: "#faf8f4" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[40px] font-bold text-gray-900 tracking-tight mb-4">Your health questions deserve real answers.</h2>
          <p className="text-[17px] text-gray-500 mb-10 max-w-xl mx-auto">
            MedMed.AI is your always-on health research companion. Start for free, no credit card required.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/pricing" className="px-10 py-4 rounded-xl bg-primary text-white font-semibold text-[16px] hover:bg-primary/90 transition-colors">
              Get started free
            </Link>
            <Link to="/chat" className="px-10 py-4 rounded-xl font-semibold text-[16px] text-gray-700 hover:bg-[#e4ddd0] transition-colors" style={{ border: "1px solid #d8d0c0" }}>
              Try the chat
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t px-8 py-8" style={{ borderColor: "#e0d8cc", backgroundColor: "#f0ebe2" }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
            <div>
              <p className="text-[16px] font-bold text-gray-900 mb-2">MedMed.AI</p>
              <p className="text-[13px] text-gray-500 max-w-xs leading-relaxed">
                General health information and education. Not a substitute for professional medical advice, diagnosis, or treatment.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-16 gap-y-2 text-[13px] text-gray-500">
              <Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
              <Link to="/policy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
              <Link to="/chat" className="hover:text-gray-900 transition-colors">Chat</Link>
              <Link to="/policy" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
              <Link to="/signin" className="hover:text-gray-900 transition-colors">Sign in</Link>
              <Link to="/policy" className="hover:text-gray-900 transition-colors">Policy Center</Link>
            </div>
          </div>
          <div className="border-t pt-5 flex flex-col sm:flex-row justify-between items-center gap-2 text-[12px] text-gray-400" style={{ borderColor: "#e0d8cc" }}>
            <p>© {new Date().getFullYear()} MedMed.AI. For informational purposes only — not medical advice.</p>
            <p>Payments by <a href="https://whop.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Whop</a>.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
