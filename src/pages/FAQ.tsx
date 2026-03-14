import { useState } from "react";
import { SiteNav } from "@/components/SiteNav";
import { GlobalFooter } from "@/components/GlobalFooter";
import { Link } from "react-router-dom";

const faqs = [
  {
    category: "Getting Started",
    items: [
      {
        q: "What is MedMed.AI?",
        a: "MedMed.AI is an AI technology company. Our product is a conversational health information engine — it helps you understand medications, symptoms, drug interactions, and pharmacy options through a natural chat interface. We are not a doctor, a hospital, or a medical provider.",
      },
      {
        q: "Is it free to use?",
        a: "Yes. We offer a free plan with limited daily questions and a 3-day full-access trial for new accounts. After your trial, you can remain on the free tier or upgrade to Pro for unlimited access, health profile memory, conversation history, and priority responses.",
      },
      {
        q: "Do I need a credit card to sign up?",
        a: "No. You can create an account and start your 3-day trial with just your email address. No payment information required until you choose to upgrade.",
      },
      {
        q: "What happens after my 3-day trial?",
        a: "Your account automatically moves to the free plan. You keep access to the chat with a daily question limit. Your health profile and conversation history remain saved. You can upgrade to Pro at any time from Settings or Pricing.",
      },
    ],
  },
  {
    category: "How medmed.ai works",
    items: [
      {
        q: "What is medmed.ai powered by?",
        a: "medmed.ai uses Google's Gemini model, customised with medical education context and your personal health profile. It is configured to provide clear, structured, educational health information — not diagnoses.",
      },
      {
        q: "How does medmed.ai use my health profile?",
        a: "When you fill out your health profile (age, sex, weight, conditions, allergies, current medications), medmed.ai reads it before every response. This means it can give you context-aware answers without you needing to repeat your information each time.",
      },
      {
        q: "Can medmed.ai diagnose me?",
        a: "No. medmed.ai is an educational information tool only. It can provide context about symptoms, medications, and health topics — but it cannot diagnose medical conditions, prescribe treatment, or replace the judgment of a licensed healthcare provider. Always consult a doctor for medical decisions.",
      },
      {
        q: "How accurate is the information?",
        a: "medmed.ai draws from medical literature and FDA drug information. While we strive for accuracy, all information systems can make mistakes. All responses include appropriate disclaimers. We always recommend verifying important information with a healthcare professional or pharmacist.",
      },
      {
        q: "What is the Interaction Checker?",
        a: "The Interaction Checker is a specialised mode where you list two or more medications and medmed.ai analyzes known interactions between them — categorised as major, moderate, or minor. It explains what each interaction involves and what precautions to consider. Always confirm with your pharmacist before changing medications.",
      },
      {
        q: "What is the Symptom Checker?",
        a: "Symptom Checker is a mode where you describe what you're experiencing in plain English. medmed.ai provides a structured educational response with possible explanations, context about when symptoms typically resolve on their own, and guidance on when to seek professional care. It does not diagnose.",
      },
    ],
  },
  {
    category: "Privacy & Data",
    items: [
      {
        q: "Is my health information private?",
        a: "Yes. Your health profile and conversations are stored securely and are never shared with or sold to third parties. We use them solely to personalize your AI responses.",
      },
      {
        q: "Do you sell my data?",
        a: "No. We do not sell, rent, or trade your personal data or health information to anyone — ever. See our Policy Center for the full details.",
      },
      {
        q: "Where is my data stored?",
        a: "Your data is stored in Cloudflare's global D1 database infrastructure, with encryption at rest and in transit. We comply with standard data security practices.",
      },
      {
        q: "Can I delete my data?",
        a: "Yes. You can request full account and data deletion at any time through the chat. We will process your request promptly.",
      },
    ],
  },
  {
    category: "Plans & Billing",
    items: [
      {
        q: "What's included in the free plan?",
        a: "The free plan includes access to medmed.ai chat with a daily question limit, basic health information responses, and account creation. The Symptom Checker, Interaction Checker, and Pharmacy Finder tools require a Pro plan.",
      },
      {
        q: "What's included in Pro?",
        a: "Pro includes unlimited questions, full health profile memory injected into every response, saved conversation history, access to all specialised tools, medication tracker, symptom journal, and priority response processing.",
      },
      {
        q: "Is there an annual discount?",
        a: "Yes. Choosing annual billing saves you significantly compared to monthly. See the Pricing page for current rates.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes. There are no long-term contracts. Cancel your subscription at any time and you retain access through the end of your billing period.",
      },
      {
        q: "What is the referral program?",
        a: "When someone signs up using your referral link, you earn 30 bonus days added to your account — automatically. There's no limit to how many referrals you can earn from. Access your referral link from your account sidebar.",
      },
    ],
  },
  {
    category: "Business & Partnerships",
    items: [
      {
        q: "How does the Sponsor program work?",
        a: "Licensed health businesses and brands can sponsor the MedMed.AI platform. Sponsors receive placement within the platform to reach an engaged health-aware audience. Contact us through the Sponsor Portal to apply.",
      },
      {
        q: "What is the Advertiser program?",
        a: "Qualified advertisers can reach MedMed.AI users with relevant health-adjacent products and services. We maintain strict standards — no misleading claims, no unapproved health products. Apply through the Advertiser Access page.",
      },
      {
        q: "Is there an affiliate program?",
        a: "Yes. Affiliates earn a commission for every paying subscriber they refer. Contact us for current affiliate terms and onboarding.",
      },
    ],
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "#e0d8cc" }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center py-5 text-left gap-6"
      >
        <span className="text-[15px] font-medium text-gray-900">{q}</span>
        <span
          className="flex-shrink-0 text-gray-400 transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "none" }}
        >
          +
        </span>
      </button>
      {open && (
        <div className="pb-5 pr-10">
          <p className="text-[14px] text-gray-600 leading-[1.75]">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />

      {/* Hero */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-5">
            Frequently asked questions
          </h1>
          <p className="text-[18px] text-gray-500 leading-relaxed">
            Everything you want to know about medmed.ai — plans, your data, and how it all works.
          </p>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="px-6 pb-24">
        <div className="max-w-3xl mx-auto space-y-14">
          {faqs.map(({ category, items }) => (
            <div key={category}>
              <h2 className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-2">{category}</h2>
              <div>
                {items.map(({ q, a }) => (
                  <FAQItem key={q} q={q} a={a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="max-w-3xl mx-auto mt-16 text-center rounded-2xl py-12 px-6"
          style={{ backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" }}>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Still have a question?</h3>
          <p className="text-[14px] text-gray-500 mb-6">
            Ask in the chat — medmed.ai can help answer questions about your account and the platform.
          </p>
          <Link to="/chat"
            className="px-6 py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors">
            Ask medmed.ai
          </Link>
        </div>
      </section>

      <GlobalFooter />
    </div>
  );
}
