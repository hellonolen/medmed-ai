import { SiteNav } from "@/components/SiteNav";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    title: "Create your account",
    detail: "Sign up in under 30 seconds. No credit card required. Your 3-day full trial starts immediately — no restrictions, no paywalls while you explore.",
  },
  {
    number: "02",
    title: "Build your health profile",
    detail: "Optionally add your age, conditions, allergies, and current medications to your profile. This information is encrypted and stored privately. The AI uses it to personalize every response — so you never have to repeat yourself.",
  },
  {
    number: "03",
    title: "Ask anything in plain English",
    detail: "Type naturally. Don't worry about phrasing your question perfectly. Ask about a medication, describe a symptom, list drug names to check for interactions, or ask where to find a specific medication nearby.",
  },
  {
    number: "04",
    title: "Get a structured, readable answer",
    detail: "MedMed AI reads your question, applies your health profile context, and returns a clear, organized answer — with headers, bullet points, and educational context. Not a list of links. Not a wall of text.",
  },
  {
    number: "05",
    title: "Use specialized tools when you need them",
    detail: "Tap the + button in the chat to switch to Symptom Checker, Pharmacy Finder, or Interaction Checker mode. Each mode uses a specialized AI approach designed for that specific type of question.",
  },
  {
    number: "06",
    title: "Track what matters",
    detail: "Log your medications and mark each dose as taken. Record symptoms with severity levels over time. View your full conversation history. Everything is saved in your account and accessible from any device.",
  },
];

const tools = [
  {
    name: "General Chat",
    icon: "💬",
    desc: "Your primary interface. Ask any health question — about a medication, a symptom, a diagnosis, a doctor's note, a treatment option — and get an immediate, personalized response.",
    examples: ["What does metformin do?", "What are the side effects of ibuprofen?", "My doctor mentioned A1C. What is that?"],
  },
  {
    name: "Symptom Checker",
    icon: "🔍",
    desc: "Describe what you're experiencing in your own words. The AI structures a response with possible explanations, context, and guidance on when to seek professional care.",
    examples: ["I have a persistent headache and sensitivity to light", "My left ankle has been swollen for 3 days", "I wake up at night with heart palpitations"],
  },
  {
    name: "Interaction Checker",
    icon: "⚕️",
    desc: "List any combination of medications. The AI analyzes known interactions between them, categorizes their severity (major, moderate, minor), and explains what each interaction means in plain terms.",
    examples: ["Aspirin + Warfarin", "Lisinopril + Potassium supplements + Spironolactone", "Sertraline + Tramadol"],
  },
  {
    name: "Pharmacy Finder",
    icon: "🏥",
    desc: "Search for medication availability, pricing information, and pharmacy options. Ask about generic alternatives, patient assistance programs, or availability of specific medications by location.",
    examples: ["Where can I find Ozempic near me?", "Is there a generic for Eliquis?", "What's the average price of Adderall?"],
  },
];

export default function HowItWorks() {
  const card = { backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] text-gray-600 mb-6" style={{ backgroundColor: "#ede8de" }}>
            Simple by design
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
            How MedMed.AI works
          </h1>
          <p className="text-[18px] text-gray-500 leading-relaxed">
            From account creation to personalized AI answers in under two minutes. Here's exactly what happens — step by step.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-1">
            {steps.map(({ number, title, detail }) => (
              <div key={number} className="flex gap-8 py-8 border-b" style={{ borderColor: "#e0d8cc" }}>
                <div className="flex-shrink-0 w-12">
                  <span className="text-[28px] font-bold text-gray-200">{number}</span>
                </div>
                <div>
                  <h2 className="text-[18px] font-semibold text-gray-900 mb-2">{title}</h2>
                  <p className="text-[15px] text-gray-600 leading-[1.7]">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools */}
      <section className="py-20 px-6" style={{ backgroundColor: "#f0ebe2" }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">The tools inside</h2>
            <p className="text-[16px] text-gray-500">Four specialized modes. All accessible from one interface.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {tools.map(({ name, icon, desc, examples }) => (
              <div key={name} className="rounded-2xl p-6" style={card}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{icon}</span>
                  <h3 className="text-[15px] font-semibold text-gray-900">{name}</h3>
                </div>
                <p className="text-[13px] text-gray-600 leading-relaxed mb-4">{desc}</p>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Example questions</p>
                  <ul className="space-y-1">
                    {examples.map(ex => (
                      <li key={ex} className="text-[12px] text-gray-500 flex items-start gap-2">
                        <span className="text-primary mt-0.5">→</span>
                        <span>"{ex}"</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Memory section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Memory that actually works</h2>
          <p className="text-[16px] text-gray-600 leading-[1.75] mb-6">
            Every time you talk to MedMed AI, it reads your health profile first. If you've told us you have Type 2 diabetes and a penicillin allergy, you'll never need to mention it again. Every answer already has that context baked in.
          </p>
          <p className="text-[16px] text-gray-600 leading-[1.75]">
            You can update your health profile at any time from the sidebar. The AI uses the latest version of your profile on every new request — automatically.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ backgroundColor: "#f0ebe2" }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Try it yourself</h2>
          <p className="text-[16px] text-gray-500 mb-8">3-day trial. No credit card. Full access.</p>
          <Link to="/signup" className="px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-[15px] hover:bg-primary/90 transition-colors">
            Get started free
          </Link>
        </div>
      </section>

      <footer className="border-t px-6 py-5" style={{ borderColor: "#e0d8cc", backgroundColor: "#f0ebe2" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-gray-500">© {new Date().getFullYear()} MedMed.AI. For informational purposes only — not medical advice.</p>
          <div className="flex items-center gap-4 text-[12px] text-gray-500">
            <Link to="/policy" className="hover:text-gray-900 transition-colors">Policy Center</Link>
            <Link to="/contact" className="hover:text-gray-900 transition-colors">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
