import { SiteNav } from "@/components/SiteNav";
import { Link } from "react-router-dom";

const team = [
  {
    name: "The Mission",
    body: "MedMed.AI was built because health information is broken. People spend hours searching across dozens of sites, getting contradictory answers, medical jargon, and zero context about their specific situation. We built a better way.",
  },
  {
    name: "What We Are",
    body: "We are an AI technology company. Our product is a conversational health information engine — not a doctor, not a hospital, not a pharmacy. We translate complex medical language into clear, personalized answers through conversation.",
  },
  {
    name: "Who We Serve",
    body: "Anyone who has ever Googled a symptom and come back more confused than before. People managing chronic conditions. Caregivers coordinating care for family members. Those who simply want to understand what their doctor just told them.",
  },
  {
    name: "How We're Different",
    body: "Most health information platforms give you a wall of search results. We give you a conversation. Our AI reads what you write, uses your context, and responds with structured, readable answers — not a list of links.",
  },
  {
    name: "Our Commitment",
    body: "We take privacy seriously. We never sell your data. We never claim to diagnose or replace professional medical care. Every answer includes appropriate disclaimers because we care more about your trust than your engagement.",
  },
];

export default function About() {
  const card = { backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12px] text-gray-600 mb-6" style={{ backgroundColor: "#ede8de" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            AI Company
          </div>
          <h1 className="text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
            We believe everyone deserves to understand their health.
          </h1>
          <p className="text-[18px] text-gray-500 leading-relaxed max-w-2xl">
            medmed.ai is a health technology company. We build technology that makes health information accessible, clear, and personal — through conversation.
          </p>
        </div>
      </section>

      {/* Divider */}
      <div className="h-px max-w-3xl mx-auto mx-6" style={{ backgroundColor: "#e0d8cc" }} />

      {/* About sections */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          {team.map(({ name, body }) => (
            <div key={name}>
              <h2 className="text-[13px] font-semibold uppercase tracking-widest text-primary mb-3">{name}</h2>
              <p className="text-[17px] text-gray-700 leading-[1.75]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-6" style={{ backgroundColor: "#f0ebe2" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-10">What we believe</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { title: "Clarity over complexity", body: "Medical information should be readable by everyone, not just clinicians." },
              { title: "Privacy by design", body: "Your health conversations are yours. We never sell or share them." },
              { title: "AI as assistant, not authority", body: "We augment your thinking — we never replace your doctor." },
            ].map(({ title, body }) => (
              <div key={title} className="rounded-2xl p-6" style={card}>
                <h3 className="text-[14px] font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-[13px] text-gray-500 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to try it?</h2>
          <p className="text-[16px] text-gray-500 mb-8">Start your free 3-day trial. No credit card required.</p>
          <Link to="/signup" className="px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-[15px] hover:bg-primary/90 transition-colors">
            Get started free
          </Link>
          <p className="text-[12px] text-gray-400 mt-5">
            Questions? <Link to="/contact" className="underline hover:text-gray-600">Contact us</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-5" style={{ borderColor: "#e0d8cc", backgroundColor: "#f0ebe2" }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-gray-500">© {new Date().getFullYear()} medmed.ai. For informational purposes only — not medical advice.</p>
          <div className="flex items-center gap-4 text-[12px] text-gray-500">
            <Link to="/policy" className="hover:text-gray-900 transition-colors">Policy Center</Link>
            <Link to="/chat" className="hover:text-gray-900 transition-colors">Support</Link>
            <Link to="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
