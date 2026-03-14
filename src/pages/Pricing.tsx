import { useState } from "react";
import { Link } from "react-router-dom";
import { SiteNav } from "@/components/SiteNav";

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

/* ─── Seat Counter ─────────────────────────────────────────────────── */
function SeatCounter({
  seats,
  min,
  perSeat,
  onChange,
}: {
  seats: number;
  min: number;
  perSeat: number;
  onChange: (n: number) => void;
}) {
  const total = seats * perSeat;
  return (
    <div style={{ background: "#fff8f0", border: "1px solid #e0d0b8", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        Team size
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => onChange(Math.max(min, seats - 1))}
          style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #ccc", background: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >−</button>
        <span style={{ fontSize: 22, fontWeight: 800, minWidth: 32, textAlign: "center" }}>{seats}</span>
        <button
          onClick={() => onChange(seats + 1)}
          style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #ccc", background: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >+</button>
        <span style={{ fontSize: 13, color: "#888", marginLeft: 4 }}>seats</span>
      </div>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 12, color: "#aaa" }}>${perSeat}/seat · min {min} seats</span>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a" }}>${total.toLocaleString()}<span style={{ fontSize: 12, fontWeight: 400, color: "#999" }}>/mo</span></span>
      </div>
    </div>
  );
}

export default function Pricing() {
  const [tab, setTab] = useState<Tab>("individual");
  const [teamSeats, setTeamSeats] = useState(5);
  const [enterpriseSeats, setEnterpriseSeats] = useState(5);

  const card = { backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" };
  const highlighted = { backgroundColor: "#f0e8d8", border: "2px solid #c8b89a" };

  const individualPlans = [
    {
      name: "Free",
      tagline: "Start here",
      price: "Free",
      priceNote: "3-day full access trial",
      seats: "1 user",
      cta: "Start free trial",
      ctaHref: "/checkout?plan=free",
      featured: false,
      features: [
        "3 days full access",
        "Symptom Checker",
        "Pharmacy Finder",
        "Interaction Checker",
        "Web chat",
      ],
    },
    {
      name: "Pro",
      tagline: "For everyday wellness",
      price: "$20",
      priceNote: "per month · 1 user",
      seats: "1 user",
      cta: "Get Pro",
      ctaHref: "/checkout?plan=pro",
      featured: true,
      features: [
        "Everything in Free",
        "Unlimited questions",
        "Live camera analysis",
        "45-second video analysis",
        "Conversation history",
        "Document storage",
        "Priority response",
      ],
    },
    {
      name: "Max",
      tagline: "Power users",
      price: "$100",
      priceNote: "per month · 1 user",
      seats: "1 user",
      cta: "Get Max",
      ctaHref: "/checkout?plan=max",
      featured: false,
      features: [
        "Everything in Pro",
        "5× more usage than Pro",
        "Higher output limits",
        "Early feature access",
        "Priority access at peak times",
      ],
    },
  ];

  const howItWorks = [
    { step: "01", title: "Choose your plan", body: "Pick the plan that fits your needs. Start free for 3 days with full access. No credit card required for the trial." },
    { step: "02", title: "Get instant answers", body: "Receive clear, structured information tailored to your question. Pro members can take a live photo or record a short video for visual analysis." },
    { step: "03", title: "Take informed action", body: "Use the information to have better conversations with your doctor or pharmacist. MedMed.AI is your health research companion." },
  ];

  const faqs = [
    { q: "Is MedMed.AI a replacement for my doctor?", a: "No. MedMed.AI provides general health information for educational purposes. Always consult a qualified healthcare professional before making any health decisions." },
    { q: "What can I use the camera feature for?", a: "Pro members can take a live photo of a visible concern — such as a skin rash, eye irritation, or wound — and receive a detailed description and educational context." },
    { q: "How does the 45-second video feature work?", a: "Pro members can record a short video with audio. Our system analyzes your appearance and visible physical characteristics, then provides helpful health-related observations. This is not a diagnosis." },
    { q: "How does team billing work?", a: "Team and Enterprise plans are billed per seat per month. You set the number of seats at checkout. You can add seats from your account at any time — new seats are prorated to your billing cycle." },
    { q: "Can I add more seats later?", a: "Yes. You can increase your seat count anytime from the Manage Plan section in your account. The additional cost is prorated to your current billing period." },
    { q: "How do I update my payment method?", a: "Go to your account → Manage Plan → Update Payment Method. You can update your card on file at any time." },
    { q: "Is my health data private?", a: "Yes. Your conversations and captures are stored securely and never shared or sold. For full details, visit our Policy Center." },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Simple, transparent pricing</h1>
          <p className="text-[17px] text-gray-500">Start free. Upgrade or add seats anytime.</p>
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
            {/* Individual Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
              {individualPlans.map((plan) => (
                <div key={plan.name} className="rounded-2xl p-6 flex flex-col" style={plan.featured ? highlighted : card}>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">{plan.tagline}</p>
                  <h2 className="text-[20px] font-bold text-gray-900 mb-3">{plan.name}</h2>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-[36px] font-bold text-gray-900 leading-none">{plan.price}</span>
                    {plan.name !== "Free" && <span className="text-[13px] text-gray-400 mb-1">/mo</span>}
                  </div>
                  <p className="text-[12px] text-gray-400 mb-1">{plan.priceNote}</p>
                  <p className="text-[11px] font-medium text-gray-500 mb-5 flex items-center gap-1">
                    <span>👤</span> {plan.seats}
                  </p>

                  <Link to={plan.ctaHref}
                    className="block w-full text-center py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors mb-6">
                    {plan.cta}
                  </Link>

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
            <div className="rounded-2xl p-8 flex flex-col" style={card}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">5+ members</p>
              <h2 className="text-[22px] font-bold text-gray-900 mb-1">Team</h2>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[32px] font-bold text-gray-900 leading-none">$25</span>
                <span className="text-[13px] text-gray-400">/seat/mo</span>
              </div>
              <p className="text-[12px] text-gray-400 mb-5">No annual discount — same price monthly</p>

              <SeatCounter seats={teamSeats} min={5} perSeat={25} onChange={setTeamSeats} />

              <Link to={`/checkout?plan=team&seats=${teamSeats}`}
                className="block w-full text-center py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors mb-6">
                Get Team · ${(teamSeats * 25).toLocaleString()}/mo
              </Link>
              <ul className="space-y-3">
                {["Everything in Pro", "Central billing for all seats", "Admin seat management", "Shared usage dashboard", "Custom usage limits per member", "Priority support"].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] text-gray-600"><Check />{f}</li>
                ))}
              </ul>
            </div>

            {/* Enterprise */}
            <div className="rounded-2xl p-8 flex flex-col" style={highlighted}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-1">Large organizations</p>
              <h2 className="text-[22px] font-bold text-gray-900 mb-1">Enterprise</h2>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-[32px] font-bold text-gray-900 leading-none">$35</span>
                <span className="text-[13px] text-gray-400">/seat/mo</span>
              </div>
              <p className="text-[12px] text-gray-400 mb-5">Billed monthly · No annual discount</p>

              <SeatCounter seats={enterpriseSeats} min={5} perSeat={35} onChange={setEnterpriseSeats} />

              <Link to={`/checkout?plan=enterprise&seats=${enterpriseSeats}`}
                className="block w-full text-center py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors mb-6">
                Get Enterprise · ${(enterpriseSeats * 35).toLocaleString()}/mo
              </Link>
              <ul className="space-y-3">
                {["Everything in Team", "Role-based access controls", "Audit logs", "Custom data retention", "Dedicated onboarding", "SLA guarantees"].map((f) => (
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

        {/* CTA */}
        <div className="text-center rounded-2xl py-14 px-8" style={highlighted}>
          <h2 className="text-[26px] font-bold text-gray-900 mb-3">Ready to get started?</h2>
          <p className="text-[15px] text-gray-500 mb-8">Free to start. No credit card required.</p>
          <div className="flex justify-center">
            <Link to="/checkout?plan=free" className="px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-[15px] hover:bg-primary/90 transition-colors">
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
