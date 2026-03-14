import { useState } from "react";
import { Link } from "react-router-dom";
import { SiteNav } from "@/components/SiteNav";

/* ─── Whop checkout links — update with your real Whop plan URLs ─── */
const WHOP = {
  pro_monthly: "https://whop.com/medmedai-pro",
  pro_annual: "https://whop.com/medmedai-pro-annual",
  max_5x: "https://whop.com/medmedai-max",
  max_20x: "https://whop.com/medmedai-max-20x",
  team: "https://whop.com/medmedai-team",
  enterprise: "https://whop.com/medmedai-enterprise",
};

type Tab = "individual" | "team";

function Check() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="flex-shrink-0 mt-0.5">
      <circle cx="7.5" cy="7.5" r="7.5" fill="#e0d8cc" />
      <path d="M4 7.5l2.5 2.5 4.5-4.5" stroke="#4a4035" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "#e0d8cc" }}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex justify-between items-center py-5 text-left gap-4">
        <span className="text-[15px] font-medium text-gray-900">{q}</span>
        <span className="text-[20px] text-gray-400 leading-none flex-shrink-0"
          style={{ transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s", display: "inline-block" }}>+</span>
      </button>
      {open && <div className="pb-5 text-[14px] text-gray-600 leading-relaxed">{a}</div>}
    </div>
  );
}

export default function Pricing() {
  const [tab, setTab] = useState<Tab>("individual");
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  const card = { backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" };
  const highlighted = { backgroundColor: "#f0e8d8", border: "2px solid #c8b89a" };

  const individualPlans = [
    {
      name: "Free",
      tagline: "3-day free trial",
      price: "Free",
      priceNote: "3 days free, then choose a plan",
      cta: "Start free trial",
      ctaHref: "/signup?from=pricing",
      featured: false,
      features: [
        "3 days full access",
        "Symptom Checker",
        "Pharmacy Finder",
        "Interaction Checker",
        "Chat on web",
      ],
    },
    {
      name: "Pro",
      tagline: "For everyday wellness",
      price: billing === "annual" ? "$17" : "$20",
      priceNote: billing === "annual" ? "Per month, billed $200/year" : "Per month",
      cta: "Get Pro",
      ctaHref: billing === "annual" ? WHOP.pro_annual : WHOP.pro_monthly,
      featured: true,
      features: [
        "Everything in Free",
        "Unlimited questions",
        "Live camera for visual analysis",
        "45-second video analysis",
        "Conversation history",
        "Document storage",
        "Priority response",
      ],
    },
    {
      name: "Max",
      tagline: "Get the most from MedMed.AI",
      price: billing === "annual" ? "$85" : "$100",
      priceNote: billing === "annual" ? "Per month, billed $1,020/year" : "Per month",
      cta: "Get Max",
      ctaHref: billing === "annual" ? WHOP.max_20x : WHOP.max_5x,
      featured: false,
      features: [
        "Everything in Pro",
        "5× more usage than Pro",
        "Higher output limits",
        "Early access to new features",
        "Priority access at peak times",
      ],
    },
  ];

  const howItWorks = [
    { step: "01", title: "Ask anything", body: "Type your question in the chat — about a medication, symptom, drug interaction, or pharmacy. Use the + button to activate a specialized mode." },
    { step: "02", title: "Get instant answers", body: "Receive clear, structured information tailored to your question. Pro members can take a live photo or record a short video for visual analysis." },
    { step: "03", title: "Take informed action", body: "Use the information to have better conversations with your doctor or pharmacist. MedMed.AI is your health research companion." },
  ];

  const faqs = [
    { q: "Is MedMed.AI a replacement for my doctor?", a: "No. MedMed.AI provides general health information for educational purposes. Always consult a qualified healthcare professional before making any health decisions." },
    { q: "What can I use the camera feature for?", a: "Pro members can take a live photo of a visible concern — such as a skin rash, eye irritation, or wound — and receive a detailed description and educational context. You must take a new photo; no existing images can be uploaded." },
    { q: "How does the 45-second video feature work?", a: "Pro members can record a short video with audio. Our system analyzes your appearance and any visible physical characteristics, then provides helpful health-related observations. This is not a diagnosis." },
    { q: "How is billing handled?", a: "Payments are processed securely. You can manage or cancel your plan at any time from your account. Annual billing is 15% less than monthly. Your access continues through the end of your billing period after cancellation." },
    { q: "Is my health data private?", a: "Yes. Your conversations and captures are stored securely in your account and are never shared or sold. For full details, visit our Policy Center." },
    { q: "What is the Interaction Checker?", a: "The Interaction Checker lets you list multiple medications and receive information about known drug interactions, their severity, and what precautions to take. Always verify with your pharmacist or physician." },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Simple, transparent pricing</h1>
          <p className="text-[17px] text-gray-500">Start free. Upgrade when you need more.</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-1 mb-10">
          {(["individual", "team"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-6 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${tab === t ? "bg-primary text-white" : "text-gray-600 hover:bg-[#e4ddd0]"}`}>
              {t === "individual" ? "Individual" : "Team & Enterprise"}
            </button>
          ))}
        </div>

        {tab === "individual" && (
          <>
            {/* Billing toggle */}
            <div className="flex justify-center items-center gap-3 mb-10">
              <span className={`text-[13px] ${billing === "monthly" ? "text-gray-900 font-medium" : "text-gray-400"}`}>Monthly</span>
              <button onClick={() => setBilling((b) => b === "monthly" ? "annual" : "monthly")}
                className="relative h-6 w-11 rounded-full transition-colors"
                style={{ backgroundColor: billing === "annual" ? "#7c3aed" : "#d1c9bc" }}>
                <span className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow transition-transform"
                  style={{ transform: billing === "annual" ? "translateX(20px)" : "translateX(0)" }} />
              </button>
              <span className={`text-[13px] ${billing === "annual" ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                Annual <span className="text-green-600 text-[11px] font-semibold ml-1">Save 15%</span>
              </span>
            </div>

            {/* Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
              {individualPlans.map((plan) => (
                <div key={plan.name} className="rounded-2xl p-6 flex flex-col" style={plan.featured ? highlighted : card}>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{plan.tagline}</p>
                  <h2 className="text-[20px] font-bold text-gray-900 mb-3">{plan.name}</h2>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-[36px] font-bold text-gray-900 leading-none">{plan.price}</span>
                    {plan.name !== "Free" && <span className="text-[13px] text-gray-400 mb-1">/mo</span>}
                  </div>
                  <p className="text-[12px] text-gray-400 mb-5">{plan.priceNote}</p>

                  <a href={plan.ctaHref}
                    target={plan.ctaHref.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="block w-full text-center py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors mb-6">
                    {plan.cta}
                  </a>

                  <ul className="space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px] text-gray-600 leading-snug">
                        <Check />{f}
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
            <div className="rounded-2xl p-8" style={card}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">5–150 members</p>
              <h2 className="text-[22px] font-bold text-gray-900 mb-2">Team</h2>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-[32px] font-bold text-gray-900 leading-none">$20</span>
                <span className="text-[13px] text-gray-400 mb-1">/seat/mo</span>
              </div>
              <p className="text-[12px] text-gray-400 mb-6">Billed annually. $25 if monthly.</p>
              <a href={WHOP.team} target="_blank" rel="noopener noreferrer"
                className="block w-full text-center py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors mb-6">
                Get Team plan
              </a>
              <ul className="space-y-3">
                {["Everything in Pro", "Central billing and team management", "Shared conversation history", "Admin controls", "Custom usage limits per member", "Priority support"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-gray-600"><Check />{f}</li>
                ))}
              </ul>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl p-8" style={highlighted}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Large organizations</p>
              <h2 className="text-[22px] font-bold text-gray-900 mb-2">Enterprise</h2>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-[32px] font-bold text-gray-900 leading-none">$25</span>
                <span className="text-[13px] text-gray-400 mb-1">/seat/mo</span>
              </div>
              <p className="text-[12px] text-gray-400 mb-6">Billed monthly.</p>
              <a href={WHOP.enterprise} target="_blank" rel="noopener noreferrer"
                className="block w-full text-center py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors mb-6">
                Get Enterprise plan
              </a>
              <ul className="space-y-3">
                {["Everything in Team", "Role-based access controls", "Audit logs", "Custom data retention", "Dedicated onboarding support", "SLA guarantees"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-gray-700"><Check />{f}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* How it works */}
        <section className="mb-20">
          <h2 className="text-[28px] font-bold text-gray-900 text-center mb-12 tracking-tight">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map(({ step, title, body }) => (
              <div key={step} className="rounded-2xl p-7" style={card}>
                <p className="text-[32px] font-black leading-none mb-3" style={{ color: "#d4c9b8" }}>{step}</p>
                <h3 className="text-[16px] font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-[13.5px] text-gray-600 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-[28px] font-bold text-gray-900 mb-10 tracking-tight">Frequently asked questions</h2>
          {faqs.map(({ q, a }) => <FAQ key={q} q={q} a={a} />)}
        </section>

        {/* CTA — no black */}
        <div className="text-center rounded-2xl py-14 px-8" style={highlighted}>
          <h2 className="text-[26px] font-bold text-gray-900 mb-3">Ready to get started?</h2>
          <p className="text-[15px] text-gray-500 mb-8">Free to start. No credit card required.</p>
          <div className="flex justify-center">
            <Link to="/signup?from=pricing" className="px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-[15px] hover:bg-primary/90 transition-colors">
              Start free trial
            </Link>
          </div>
        </div>

        <p className="text-center text-[12px] text-gray-400 mt-8">
          Payments handled securely. Cancel anytime. Prices exclude applicable tax.{" "}
          <Link to="/policy" className="underline hover:text-gray-600">Policy Center</Link>.
        </p>
      </div>
    </div>
  );
}
