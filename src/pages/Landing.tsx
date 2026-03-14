import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SiteNav } from "@/components/SiteNav";

/* ─── FAQ accordion item ── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "#d8d0c0" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex justify-between items-center py-5 text-left gap-4"
      >
        <span className="text-[15px] font-semibold text-gray-900">{q}</span>
        <span
          className="text-[22px] text-gray-400 leading-none flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "none", display: "inline-block" }}
        >+</span>
      </button>
      {open && (
        <div className="pb-5 text-[14px] text-gray-600 leading-relaxed max-w-3xl">{a}</div>
      )}
    </div>
  );
}

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
  const [liveCount, setLiveCount] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://medmed-agent.hellonolen.workers.dev/api/stats")
      .then(r => r.json() as Promise<{ totalQuestions: number }>)
      .then(d => { if (d.totalQuestions > 0) setLiveCount(d.totalQuestions); })
      .catch(() => {});
  }, []);

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
              {liveCount ? `${liveCount.toLocaleString()} questions answered` : "Now available for everyone"}
            </div>
            <h1 className="text-5xl lg:text-[58px] font-bold text-gray-900 leading-[1.1] tracking-tight mb-5">
              Health information,<br />powered by conversation.
            </h1>
            <p className="text-[17px] text-gray-500 mb-10 leading-relaxed max-w-md">
              Ask about medications, symptoms, drug combinations, or pharmacy locations. Get clear, structured answers instantly — right in the chat.
            </p>
            <div>
              <Link to="/pricing" className="px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-[15px] hover:bg-primary/90 transition-colors">
                Get started free
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



      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 px-6" style={{ backgroundColor: "#faf8f4" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[36px] font-bold text-gray-900 tracking-tight mb-3">How it works</h2>
            <p className="text-[16px] text-gray-500 max-w-xl mx-auto">MedMed.AI is a conversational system. You talk to it. It responds with structured, educational information. Here is exactly what happens when you use it.</p>
          </div>
          <div className="space-y-5">
            {[
              {
                n: "01",
                title: "Open the chat",
                body: "Go to the chat interface from any page. No setup, no onboarding flow, no tutorial. It is a text box. Type in it.",
              },
              {
                n: "02",
                title: "Ask your question in plain English",
                body: "You do not need to use medical terminology. Type exactly what you would say to a friend. \"I take lisinopril and ibuprofen — is that okay?\" or \"what could cause a rash on my forearm?\" or \"find a pharmacy open right now near me.\" The system understands natural language.",
              },
              {
                n: "03",
                title: "Use a specialized mode when you need one",
                body: "Tap the + button to the left of the chat input to access three focused modes: Symptom Checker walks you through a structured symptom intake. Pharmacy Finder locates pharmacies by location. Interaction Checker takes a list of medications and returns interaction information. Each mode guides you through a purpose-built flow without leaving the chat.",
              },
              {
                n: "04",
                title: "Pro members: use your camera or record a video",
                body: "If you are on a Pro plan, the camera and video buttons appear next to the + icon. Tap the camera button to take a live photo of something visible — a skin concern, a label, a wound. Tap the video button to record up to 45 seconds with audio. The system analyzes what it sees and returns a detailed written description and educational context. Nothing from your camera roll is used. Live capture only.",
              },
              {
                n: "05",
                title: "Read your response, then act on it",
                body: "Every response is structured for clarity — not a wall of text. Key points are broken out. Context is given. You can follow up, ask again in a different way, or use what you learned to have a more productive conversation with a pharmacist or physician. Your conversation history is saved to your account on Pro and Max plans.",
              },
            ].map(({ n, title, body }) => (
              <div key={n} className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4 items-start rounded-2xl p-7" style={{ backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" }}>
                <span className="text-[13px] font-bold text-gray-300 tracking-widest pt-0.5">{n}</span>
                <div>
                  <h3 className="text-[17px] font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-[14px] text-gray-500 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
          {/* Pro visual — no emojis */}
          <div className="rounded-2xl p-10 flex flex-col justify-center gap-6 border" style={{ backgroundColor: "#fdf9f2", borderColor: "#e0d8cc", minHeight: 280 }}>
            <div className="flex gap-8">
              {[
                { label: "Live Camera", sub: "Take a photo now" },
                { label: "45s Video", sub: "Record with audio" },
              ].map(({ label, sub }) => (
                <div key={label} className="flex flex-col gap-1">
                  <span className="text-[15px] font-bold text-gray-900">{label}</span>
                  <span className="text-[12px] text-gray-400">{sub}</span>
                  <span className="text-[11px] font-semibold text-primary mt-1">Pro only</span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-gray-400 leading-relaxed">No uploads from your camera roll. Live capture only. Analyzed in real time.</p>
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

      {/* ── ABOUT ── */}
      <section id="about" className="py-20 px-6" style={{ backgroundColor: "#faf8f4" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-[36px] font-bold text-gray-900 tracking-tight mb-5">About MedMed.AI</h2>
              <p className="text-[16px] text-gray-600 leading-relaxed mb-5">
                MedMed.AI is an AI company. We build conversational tools that help people access health information quickly, clearly, and on demand.
              </p>
              <p className="text-[16px] text-gray-500 leading-relaxed mb-5">
                We are not a healthcare provider. We do not diagnose, treat, or prescribe. What we do is give you access to structured, educational information about medications, symptoms, drug interactions, and pharmacy resources — through a simple chat interface that works like talking to someone who has read everything.
              </p>
              <p className="text-[16px] text-gray-500 leading-relaxed">
                The average person waits days for a doctor's appointment to ask a question they could have answered in 30 seconds. MedMed.AI exists to close that gap. Not to replace professional care — but to make sure you show up to it informed.
              </p>
            </div>
            <div className="space-y-5">
              {[
                {
                  title: "Conversation-first",
                  body: "Everything happens in the chat. No forms, no portals, no workflow to learn. You type. It responds. The interface gets out of the way.",
                },
                {
                  title: "Information, not advice",
                  body: "MedMed.AI provides educational context based on your questions. It does not tell you what to do. It tells you what is known so you can make better decisions with a qualified professional.",
                },
                {
                  title: "Built for access",
                  body: "Health information is not equally distributed. We built MedMed.AI to be fast, affordable, and accessible to anyone — regardless of location, insurance status, or how much time they have.",
                },
              ].map(({ title, body }) => (
                <div key={title} className="rounded-2xl p-6" style={{ backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" }}>
                  <h3 className="text-[15px] font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-[13px] text-gray-500 leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-6" style={{ backgroundColor: "#f0ebe2" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-[36px] font-bold text-gray-900 tracking-tight mb-3">Frequently asked questions</h2>
            <p className="text-[16px] text-gray-500">Straight answers. No runaround.</p>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "What is MedMed.AI?",
                a: "MedMed.AI is an AI-powered conversational tool that gives you access to structured health information. You type a question — about a medication, a symptom, a drug combination, or a pharmacy — and it responds with clear, organized educational context. It is not a doctor and does not replace one.",
              },
              {
                q: "Is this a medical service?",
                a: "No. MedMed.AI is an AI information tool. Nothing produced by this platform constitutes medical advice, a diagnosis, or a treatment recommendation. All information is educational and general in nature. If you are experiencing a health emergency, contact emergency services immediately.",
              },
              {
                q: "What can the free plan do?",
                a: "The free plan gives you access to the chat, the Symptom Checker, the Pharmacy Finder, and the Interaction Checker. You are limited to 5 questions per session. No account history is saved on the free plan.",
              },
              {
                q: "What does Pro add?",
                a: "Pro gives you unlimited questions, saved conversation history, document storage, and priority responses. It also unlocks the camera and video features — you can take a live photo or record up to 45 seconds of video and receive a detailed description and educational context from the system.",
              },
              {
                q: "How does the camera feature work?",
                a: "On the Pro plan, a camera button appears in the chat input bar. Tap it to open your device camera and take a live photo. The system analyzes the image and returns a written description with educational context. No images from your camera roll can be uploaded — live capture only. All captured images are saved to your account.",
              },
              {
                q: "How does the video feature work?",
                a: "The video button also appears in the chat input on Pro. Tap it to begin recording — you get up to 45 seconds with audio. The system analyzes the video and returns a written description. All recordings are saved to your account in your media history.",
              },
              {
                q: "Is my data private?",
                a: "Yes. Your conversations and media captures are stored securely and tied to your account. They are not shared with third parties and are not used to train models or sold. For full details, see the Policy Center.",
              },
              {
                q: "How does billing work?",
                a: "Billing is handled securely. You can start on the free trial with no credit card. If you upgrade, you can choose monthly or annual billing. Annual billing on the Pro plan saves approximately 15% compared to monthly. You can cancel anytime — your access continues through the end of your billing period.",
              },
              {
                q: "What is the Max plan?",
                a: "Max is for power users who need significantly more usage than Pro. It gives you 5× more usage than Pro, higher output limits on all responses, priority access at peak traffic times, and early access to new features as they launch.",
              },
              {
                q: "Can I use MedMed.AI on my phone?",
                a: "Yes. MedMed.AI is a web application that works on any modern browser on any device — desktop, tablet, or mobile. The camera and video features require a device with a camera, which most phones have.",
              },
            ].map(({ q, a }) => (
              <FAQItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>

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
                { tier: "Free trial", price: "3 days free", note: "Full access for 3 days, then choose a plan" },
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
            <div className="flex flex-col gap-2 text-[13px] text-gray-500">
              <Link to="/pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
              <Link to="/chat" className="hover:text-gray-900 transition-colors">Chat</Link>
              <Link to="/signin" className="hover:text-gray-900 transition-colors">Sign in</Link>
            </div>
          </div>
          <div className="border-t pt-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-[12px] text-gray-400" style={{ borderColor: "#e0d8cc" }}>
            <p>© {new Date().getFullYear()} MedMed.AI. For informational purposes only — not medical advice.</p>

            <div className="flex items-center gap-4">
              <Link to="/policy" className="hover:text-gray-700 transition-colors">Policy Center</Link>
              <Link to="/chat" className="hover:text-gray-700 transition-colors">Support</Link>
              <Link to="/chat" className="hover:text-gray-700 transition-colors">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
