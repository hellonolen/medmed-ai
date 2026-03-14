import { useState } from "react";
import { Link } from "react-router-dom";

/* ─── Whop checkout links — update these with your real Whop plan URLs ─── */
const WHOP = {
  pro_monthly: "https://whop.com/medmedai-pro",
  pro_annual: "https://whop.com/medmedai-pro-annual",
  max_5x: "https://whop.com/medmedai-max",
  max_20x: "https://whop.com/medmedai-max-20x",
};

/* ─── Types ─── */
type Tab = "individual" | "team";

interface Plan {
  name: string;
  tagline: string;
  price: string;
  priceNote: string;
  cta: string;
  ctaLink: string;
  featured?: boolean;
  features: string[];
}

/* ─── Check icon ─── */
function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0 mt-0.5">
      <circle cx="7.5" cy="7.5" r="7.5" fill="#d4c9b8" />
      <path d="M4 7.5l2.5 2.5 4.5-4.5" stroke="#1a1a1a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── FAQ Item ─── */
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "#e0d8cc" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center py-5 text-left gap-4"
      >
        <span className="text-[15px] font-medium text-gray-900">{q}</span>
        <span className="text-[20px] text-gray-400 leading-none flex-shrink-0" style={{ transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
      </button>
      {open && (
        <div className="pb-5 text-[14px] text-gray-600 leading-relaxed">{a}</div>
      )}
    </div>
  );
}

/* ─── Pricing Page ─── */
export default function Pricing() {
  const [tab, setTab] = useState<Tab>("individual");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const cardStyle = { backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" };
  const featuredStyle = { backgroundColor: "#1a1a1a", border: "1px solid #1a1a1a" };

  const individualPlans: Plan[] = [
    {
      name: "Free",
      tagline: "Get started",
      price: "$0",
      priceNote: "Free for everyone",
      cta: "Get started",
      ctaLink: "/signup",
      features: [
        "5 questions per session",
        "Medication information lookup",
        "General health questions",
        "Chat on web",
        "Access to Symptom Checker",
        "Access to Pharmacy Finder",
        "Access to Interaction Checker",
      ],
    },
    {
      name: "Pro",
      tagline: "For everyday wellness",
      price: billing === "annual" ? "$17" : "$20",
      priceNote: billing === "annual"
        ? "Per month, billed $200 annually"
        : "Per month, billed monthly",
      cta: "Upgrade to Pro",
      ctaLink: billing === "annual" ? WHOP.pro_annual : WHOP.pro_monthly,
      featured: true,
      features: [
        "Everything in Free, plus:",
        "Unlimited questions",
        "Camera — take a live photo for visual analysis",
        "Video — record up to 45 seconds for analysis",
        "Conversation history",
        "Document storage",
        "Priority response",
      ],
    },
    {
      name: "Max",
      tagline: "Get the most out of MedMed.AI",
      price: "$100",
      priceNote: "Per person, billed monthly",
      cta: "Upgrade to Max",
      ctaLink: WHOP.max_5x,
      features: [
        "Everything in Pro, plus:",
        "5x or 20x more usage than Pro",
        "Higher output limits for all requests",
        "Early access to new features",
        "Priority access at high-traffic times",
      ],
    },
  ];

  const teamFeatures = [
    "Everything in Pro",
    "Central billing and team management",
    "Shared conversation history",
    "Admin controls",
    "Custom usage limits per member",
    "Priority support",
  ];

  const faqs = [
    {
      q: "Is MedMed.AI a replacement for my doctor?",
      a: "No. MedMed.AI provides general health information and education. It is not a medical diagnosis tool. Always consult a qualified healthcare professional before making any health decisions.",
    },
    {
      q: "What can I use the camera feature for?",
      a: "Pro members can take a live photo of a visible concern — such as a skin rash, eye irritation, or wound — and receive a detailed description and educational context from our visual analysis. No existing photos can be uploaded; you must take a new photo in real time.",
    },
    {
      q: "How does the 45-second video feature work?",
      a: "Pro members can record a short video with audio. Our system analyzes your appearance and any visible physical characteristics, then provides helpful health-related observations. This is not a diagnosis.",
    },
    {
      q: "How is billing handled?",
      a: "Payments are processed securely through Whop. You can cancel anytime from your account dashboard. Annual billing gives you two months free compared to monthly.",
    },
    {
      q: "Is my health data private?",
      a: "Yes. Your conversations and media captures are stored securely in your account and are never shared or sold. See our Privacy Policy for full details.",
    },
    {
      q: "Can I upgrade or downgrade my plan?",
      a: "Yes. You can change plans at any time. If you upgrade mid-cycle, you'll be charged a prorated amount. If you downgrade, your new plan takes effect at the next billing date.",
    },
    {
      q: "What is the Interaction Checker?",
      a: "The Interaction Checker lets you list multiple medications and get information about known drug interactions, their severity, and recommended precautions. Always verify with your pharmacist or physician.",
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Nav */}
      <header className="px-8 py-5 flex items-center justify-between border-b" style={{ borderColor: "#e0d8cc" }}>
        <Link to="/" className="text-[17px] font-bold text-gray-900 tracking-tight">MedMed.AI</Link>
        <div className="flex gap-3">
          <Link to="/signin" className="px-4 py-2 rounded-xl text-[13px] text-gray-600 hover:bg-[#e4ddd0] transition-colors">Sign in</Link>
          <Link to="/signup" className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white bg-primary hover:bg-primary/90 transition-colors">Get started</Link>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Simple, transparent pricing</h1>
          <p className="text-[17px] text-gray-500 max-w-xl mx-auto">Start free. Upgrade when you need more.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center gap-1 mb-10">
          {(["individual", "team"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors capitalize ${
                tab === t ? "bg-primary text-white" : "text-gray-600 hover:bg-[#e4ddd0]"
              }`}
            >
              {t === "individual" ? "Individual" : "Team & Enterprise"}
            </button>
          ))}
        </div>

        {tab === "individual" && (
          <>
            {/* Monthly / Annual toggle */}
            <div className="flex justify-center items-center gap-3 mb-10">
              <span className={`text-[13px] ${billing === "monthly" ? "text-gray-900 font-medium" : "text-gray-400"}`}>Monthly</span>
              <button
                onClick={() => setBilling((b) => b === "monthly" ? "annual" : "monthly")}
                className="relative h-6 w-11 rounded-full transition-colors"
                style={{ backgroundColor: billing === "annual" ? "#7c3aed" : "#d1c9bc" }}
              >
                <span
                  className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform"
                  style={{ transform: billing === "annual" ? "translateX(20px)" : "translateX(0)" }}
                />
              </button>
              <span className={`text-[13px] ${billing === "annual" ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                Annual <span className="text-green-600 text-[11px] font-semibold">Save 15%</span>
              </span>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
              {individualPlans.map((plan) => (
                <div
                  key={plan.name}
                  className="rounded-2xl p-6 flex flex-col"
                  style={plan.featured ? featuredStyle : cardStyle}
                >
                  <div className="mb-5">
                    <p className={`text-[12px] font-semibold uppercase tracking-widest mb-1 ${plan.featured ? "text-gray-400" : "text-gray-400"}`}>
                      {plan.tagline}
                    </p>
                    <h2 className={`text-[20px] font-bold mb-3 ${plan.featured ? "text-white" : "text-gray-900"}`}>{plan.name}</h2>
                    <div className="flex items-end gap-1 mb-1">
                      <span className={`text-[36px] font-bold leading-none ${plan.featured ? "text-white" : "text-gray-900"}`}>{plan.price}</span>
                      {plan.name !== "Free" && <span className={`text-[13px] mb-1 ${plan.featured ? "text-gray-400" : "text-gray-400"}`}>/mo</span>}
                    </div>
                    <p className={`text-[12px] ${plan.featured ? "text-gray-500" : "text-gray-400"}`}>{plan.priceNote}</p>
                  </div>

                  <a
                    href={plan.ctaLink}
                    target={plan.ctaLink.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={`block w-full text-center py-3 rounded-xl text-[14px] font-semibold transition-colors mb-6 ${
                      plan.featured
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : "bg-primary text-white hover:bg-primary/90"
                    }`}
                  >
                    {plan.cta}
                  </a>

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2.5 text-[13px] leading-snug ${
                        plan.featured ? (f.endsWith(":") ? "text-gray-500 font-semibold" : "text-gray-300") : (f.endsWith(":") ? "text-gray-500 font-semibold" : "text-gray-600")
                      }`}>
                        {!f.endsWith(":") && <Check />}
                        <span className={f.endsWith(":") ? "pl-5" : ""}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "team" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-16">
            {/* Team */}
            <div className="rounded-2xl p-8" style={cardStyle}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">For teams of 5–150</p>
              <h2 className="text-[22px] font-bold text-gray-900 mb-2">Team</h2>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-[32px] font-bold text-gray-900 leading-none">$20</span>
                <span className="text-[13px] text-gray-400 mb-1">/seat/mo annually</span>
              </div>
              <p className="text-[12px] text-gray-400 mb-6">$25 if billed monthly</p>
              <a href={WHOP.pro_annual} target="_blank" rel="noopener noreferrer"
                className="block w-full text-center py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors mb-6">
                Get Team plan
              </a>
              <ul className="space-y-3">
                {teamFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-gray-600"><Check />{f}</li>
                ))}
              </ul>
            </div>
            {/* Enterprise */}
            <div className="rounded-2xl p-8" style={{ backgroundColor: "#1a1a1a", border: "1px solid #1a1a1a" }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-1">For large organizations</p>
              <h2 className="text-[22px] font-bold text-white mb-2">Enterprise</h2>
              <p className="text-[15px] text-gray-400 mb-6 leading-relaxed">Custom pricing based on usage and seats. Includes everything in Team plus dedicated support, custom data retention, SLA, and compliance options.</p>
              <a href="mailto:enterprise@medmed.ai"
                className="block w-full text-center py-3 rounded-xl bg-white text-gray-900 text-[14px] font-semibold hover:bg-gray-100 transition-colors">
                Contact us
              </a>
            </div>
          </div>
        )}

        {/* ── How it works ── */}
        <section className="mb-20">
          <h2 className="text-[28px] font-bold text-gray-900 text-center mb-12 tracking-tight">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Ask anything",
                body: "Type your question in the chat — about a medication, symptom, drug interaction, or pharmacy. Use the + button to switch to a specialized mode.",
              },
              {
                step: "02",
                title: "Get instant answers",
                body: "Receive clear, structured information tailored to your question. Pro members can also take a live photo or record a video for visual analysis.",
              },
              {
                step: "03",
                title: "Take informed action",
                body: "Use the information to have better conversations with your doctor, pharmacist, or care team. MedMed.AI is your health research companion.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="rounded-2xl p-7" style={cardStyle}>
                <p className="text-[30px] font-black text-primary/20 mb-3 leading-none">{step}</p>
                <h3 className="text-[16px] font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-[13.5px] text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="mb-16">
          <h2 className="text-[28px] font-bold text-gray-900 mb-10 tracking-tight">Frequently asked questions</h2>
          <div>
            {faqs.map(({ q, a }) => <FAQ key={q} q={q} a={a} />)}
          </div>
        </section>

        {/* CTA */}
        <div className="text-center rounded-2xl py-14 px-8" style={{ backgroundColor: "#1a1a1a" }}>
          <h2 className="text-[26px] font-bold text-white mb-3">Ready to get started?</h2>
          <p className="text-[15px] text-gray-400 mb-8">Free to start. No credit card required.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/signup" className="px-8 py-3.5 rounded-xl bg-white text-gray-900 font-semibold text-[15px] hover:bg-gray-100 transition-colors">
              Create free account
            </Link>
            <a href={WHOP.pro_monthly} target="_blank" rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-xl text-white font-semibold text-[15px] hover:bg-white/10 transition-colors" style={{ border: "1px solid rgba(255,255,255,0.25)" }}>
              See Pro plans
            </a>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-[12px] text-gray-400 mt-8">
          Payments handled securely by{" "}
          <a href="https://whop.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">Whop</a>.
          {" "}Cancel anytime. Prices do not include applicable tax.{" "}
          <Link to="/policy" className="underline hover:text-gray-600">Privacy & Terms</Link>.
        </p>
      </div>
    </div>
  );
}
