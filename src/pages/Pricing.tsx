import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    description: "Get started with AI-powered healthcare search.",
    features: [
      "5 AI queries every 48 hours",
      "Medication & symptom search",
      "Pharmacy finder",
      "Interaction checker",
    ],
    cta: "Get started free",
    href: "/signup",
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$20",
    period: "/month",
    description: "Unlimited access for individuals and patients.",
    features: [
      "Unlimited AI queries",
      "Conversation history",
      "500MB document storage",
      "Priority response speed",
      "All free features",
    ],
    cta: "Start Pro",
    href: "/signup?plan=pro",
    highlight: true,
  },
  {
    id: "max",
    name: "Max",
    price: "$100",
    period: "/month",
    description: "For healthcare professionals and teams.",
    features: [
      "Everything in Pro",
      "5GB document storage",
      "Team access (up to 5 seats)",
      "Priority AI processing",
      "Dedicated support",
      "API access (coming soon)",
    ],
    cta: "Start Max",
    href: "/signup?plan=max",
    highlight: false,
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen px-6 py-16" style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <Link to="/" className="text-[13px] text-gray-500 hover:text-gray-900 block mb-6">← Back to MedMed.AI</Link>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">Simple, honest pricing</h1>
          <p className="text-[16px] text-gray-500">Upgrade anytime. Cancel anytime. No refunds.</p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl p-7 flex flex-col transition-shadow"
              style={{
                backgroundColor: plan.highlight ? "#fff" : "#fdf9f2",
                border: plan.highlight ? "2px solid var(--color-primary, #7c3aed)" : "1px solid #e0d8cc",
                boxShadow: plan.highlight ? "0 8px 30px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {plan.highlight && (
                <div className="text-[11px] font-bold uppercase tracking-widest text-primary mb-4">Most popular</div>
              )}
              <h2 className="text-[18px] font-bold text-gray-900 mb-1">{plan.name}</h2>
              <div className="flex items-baseline gap-0.5 mb-2">
                <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                <span className="text-gray-500 text-[14px]">{plan.period}</span>
              </div>
              <p className="text-[13.5px] text-gray-500 mb-6">{plan.description}</p>

              <ul className="space-y-2.5 flex-1 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-gray-700">
                    <span className="mt-0.5 text-primary font-bold flex-shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate(plan.href)}
                className={`w-full py-3 rounded-xl text-[14px] font-semibold transition-all ${
                  plan.highlight
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-[#e8e0d0] text-gray-800 hover:bg-[#ddd5c5]"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center mt-12 space-y-2">
          <p className="text-[13px] text-gray-500">All plans include unlimited access to MedMed.AI healthcare search.</p>
          <p className="text-[13px] text-gray-500">
            Questions? <a href="mailto:support@medmed.ai" className="text-primary underline">support@medmed.ai</a>
            {" · "}
            <Link to="/policy#cancel" className="text-primary underline">Cancellation Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
