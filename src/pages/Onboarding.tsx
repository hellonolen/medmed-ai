import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Onboarding() {
  const { user } = useAuth();
  const userMeta = user as { user_metadata?: { name?: string }; name?: string } | null;
  const name = userMeta?.user_metadata?.name || userMeta?.name || "there";
  const firstName = name.split(" ")[0];

  const steps = [
    {
      n: "01",
      title: "Open the chat",
      body: "The chat is your home base. Ask anything in plain English — medications, symptoms, interactions, or pharmacies. No jargon required.",
      cta: "Open chat",
      href: "/chat",
    },
    {
      n: "02",
      title: "Try the Symptom Checker",
      body: "Use the + button in the chat to switch to Symptom Checker mode. Walk through a structured flow and get educational context on possible conditions.",
      cta: "Try it",
      href: "/chat",
    },
    {
      n: "03",
      title: "Check a drug interaction",
      body: "In the + menu, choose Interaction Checker. List two or more medications and see what is known about combining them.",
      cta: "Check interactions",
      href: "/chat",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16"
      style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Link to="/" className="text-[17px] font-bold text-gray-900 tracking-tight block mb-8">
            MedMed.AI
          </Link>
          <h1 className="text-[34px] font-bold text-gray-900 tracking-tight mb-3">
            Welcome, {firstName}.
          </h1>
          <p className="text-[16px] text-gray-500">
            Your 3-day trial is active. Here is how to get started.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-10">
          {steps.map(({ n, title, body, cta, href }) => (
            <div
              key={n}
              className="rounded-2xl p-6 flex gap-5 items-start"
              style={{ backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" }}
            >
              <span className="text-[12px] font-bold text-gray-300 tracking-widest pt-1 min-w-[28px]">{n}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-[15px] font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed mb-3">{body}</p>
                <Link to={href} className="text-[13px] font-semibold text-primary hover:underline">
                  {cta} →
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/chat"
            className="px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-[15px] hover:bg-primary/90 transition-colors text-center"
          >
            Go to chat
          </Link>
          <Link
            to="/pricing"
            className="px-8 py-3.5 rounded-xl font-semibold text-[15px] text-gray-700 hover:bg-[#e4ddd0] transition-colors text-center"
            style={{ border: "1px solid #d8d0c0" }}
          >
            See all plans
          </Link>
        </div>

        <p className="text-center text-[12px] text-gray-400 mt-6">
          <Link to="/policy" className="hover:text-gray-700 transition-colors">Policy Center</Link>
          {" · "}
          <Link to="/contact" className="hover:text-gray-700 transition-colors">Contact</Link>
        </p>
      </div>
    </div>
  );
}
