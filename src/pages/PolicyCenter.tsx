import { useState } from "react";
import { Link } from "react-router-dom";

/* ─── Policy sections definition ─────────────────────────── */
const SECTIONS = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "data", label: "Data Policy" },
  { id: "content", label: "Content Policy" },
  { id: "terms", label: "Terms of Service" },
  { id: "disclaimer", label: "Medical Disclaimer" },
  { id: "cancel", label: "Cancellation Policy" },
  { id: "cookies", label: "Cookie Policy" },
  { id: "scope", label: "Scope & Devices" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const EFFECTIVE_DATE = "March 13, 2025";

/* ─── Section content ─────────────────────────────────────── */
const content: Record<SectionId, { title: string; body: JSX.Element }> = {
  privacy: {
    title: "Privacy Policy",
    body: (
      <div className="space-y-6">
        <p>MedMed.AI ("we," "us," "our") is committed to protecting your personal information. This policy explains what we collect, why we collect it, and how you can control it.</p>
        <h3 className="font-semibold text-gray-900">What We Collect</h3>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Account data:</strong> name, email, encrypted password</li>
          <li><strong>Usage data:</strong> queries submitted, conversation history (Pro), feature interactions</li>
          <li><strong>Payment data:</strong> processed by Stripe — we never store card numbers</li>
          <li><strong>Device & log data:</strong> IP address, browser type, timestamps for security</li>
          <li><strong>Uploaded documents (Pro):</strong> stored privately in Cloudflare R2</li>
        </ul>
        <h3 className="font-semibold text-gray-900">How We Use It</h3>
        <ul className="list-disc ml-5 space-y-1">
          <li>To provide, improve, and personalize the MedMed.AI service</li>
          <li>To process subscriptions and send transactional emails</li>
          <li>To detect fraud, abuse, and security threats</li>
          <li>To comply with applicable laws</li>
        </ul>
        <p>We do not sell your data. We do not use your queries to train AI models.</p>
        <h3 className="font-semibold text-gray-900">Query Processing</h3>
        <p>Queries submitted to MedMed.AI are processed securely through our backend infrastructure. We do not include personally identifiable information in query prompts beyond what you type. Responses are for informational purposes only and do not constitute medical advice.</p>
        <h3 className="font-semibold text-gray-900">Your Rights</h3>
        <p>You may request access, correction, or deletion of your data at any time. Email <a href="mailto:privacy@medmed.ai" className="text-primary underline">privacy@medmed.ai</a>. We respond within 30 days.</p>
      </div>
    ),
  },
  data: {
    title: "Data Policy",
    body: (
      <div className="space-y-6">
        <p>This policy describes the types of data MedMed.AI collects, processes, and stores across all platforms.</p>
        <h3 className="font-semibold text-gray-900">Cookie Information</h3>
        <p>We use browser localStorage to store session tokens, user preferences, and usage quota. We do not use advertising cookies or third-party tracking pixels.</p>
        <h3 className="font-semibold text-gray-900">Personal Information</h3>
        <p>Personal information is information that can be used to identify you, including your name, email address, and billing information. We collect this only as necessary to provide the service.</p>
        <h3 className="font-semibold text-gray-900">Personally Identifiable Information (PII)</h3>
        <p>We treat all email addresses, names, and account data as PII. PII is encrypted at rest and in transit. We apply the principle of data minimization — we only collect what is strictly necessary.</p>
        <h3 className="font-semibold text-gray-900">Retention Schedule</h3>
        <ul className="list-disc ml-5 space-y-1">
          <li>Account data: retained until account deletion</li>
          <li>Conversation history (Pro): 90 days, then archived to your R2 storage</li>
          <li>Uploaded documents: until you delete them or close your account</li>
          <li>Log data: 30 days</li>
          <li>Payment records: as required by law (typically 7 years)</li>
        </ul>
        <h3 className="font-semibold text-gray-900">Third-Party Processors</h3>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Cloudflare:</strong> infrastructure, CDN, R2 storage, D1 database</li>
          <li><strong>Stripe:</strong> payment processing</li>
        </ul>
      </div>
    ),
  },
  content: {
    title: "Content Policy",
    body: (
      <div className="space-y-6">
        <p>This policy governs what content may be submitted to or shared through MedMed.AI across all content types.</p>
        <h3 className="font-semibold text-gray-900">Text Content</h3>
        <p>You may submit text queries about medications, symptoms, and healthcare topics. You may not submit:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Content intended to harm, deceive, or manipulate others</li>
          <li>False medical information presented as factual</li>
          <li>Personally identifiable health information of other individuals without consent</li>
          <li>Requests designed to elicit prescriptions or controlled substance information</li>
        </ul>
        <h3 className="font-semibold text-gray-900">Audio Content</h3>
        <p>Where voice input is available, audio is processed locally and converted to text before transmission. We do not store raw audio recordings. You may not use voice features to submit content that violates this policy.</p>
        <h3 className="font-semibold text-gray-900">Video Content</h3>
        <p>MedMed.AI does not currently support video uploads. Any future video features will be governed by this policy, including prohibitions on misleading health content, unauthorized use of third-party footage, and content featuring minors.</p>
        <h3 className="font-semibold text-gray-900">Uploaded Documents (Pro)</h3>
        <p>Pro users may upload medical documents, research papers, and articles to their storage library. Documents must not contain:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Other patients' protected health information (PHI) without anonymization</li>
          <li>Copyrighted material uploaded without authorization</li>
          <li>Malicious files or executables</li>
        </ul>
        <h3 className="font-semibold text-gray-900">Enforcement</h3>
        <p>Violations of this policy may result in content removal, account suspension, or permanent termination at our discretion.</p>
      </div>
    ),
  },
  terms: {
    title: "Terms of Service",
    body: (
      <div className="space-y-6">
        <p>By accessing MedMed.AI, you agree to these Terms of Service. If you do not agree, do not use the service.</p>
        <h3 className="font-semibold text-gray-900">Service Description</h3>
        <p>MedMed.AI is a healthcare information platform. It provides information about medications, symptoms, pharmacies, and healthcare services worldwide.</p>
        <p className="font-medium">MedMed.AI provides information only. It does not provide medical diagnoses, prescriptions, or professional medical advice.</p>
        <h3 className="font-semibold text-gray-900">Accounts</h3>
        <p>You must be at least 18 years old to create an account. You are responsible for all activity under your account.</p>
        <h3 className="font-semibold text-gray-900">Plans & Billing</h3>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Free:</strong> 5 AI queries per 48-hour period</li>
          <li><strong>Pro ($20/mo):</strong> unlimited queries, conversation history, 500MB storage</li>
          <li><strong>Max ($100/mo):</strong> everything in Pro + priority processing, team access, 5GB storage</li>
        </ul>
        <h3 className="font-semibold text-gray-900">Intellectual Property</h3>
        <p>All platform content and technology are owned by MedMed.AI. You retain ownership of content you submit.</p>
        <h3 className="font-semibold text-gray-900">Limitation of Liability</h3>
        <p>To the maximum extent permitted by law, MedMed.AI shall not be liable for any indirect, incidental, or consequential damages. Our total liability shall not exceed amounts paid by you in the prior 12 months.</p>
        <h3 className="font-semibold text-gray-900">Governing Law</h3>
        <p>These Terms are governed by the laws of the United States. Disputes shall be resolved through binding arbitration.</p>
        <h3 className="font-semibold text-gray-900">Contact</h3>
        <p>Email: <a href="mailto:support@medmed.ai" className="text-primary underline">support@medmed.ai</a></p>
      </div>
    ),
  },
  disclaimer: {
    title: "Medical Disclaimer",
    body: (
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="font-semibold text-amber-900">Important: MedMed.AI is not a medical provider.</p>
        </div>
        <p>The information provided by MedMed.AI, including all AI-generated responses, is for <strong>informational and educational purposes only</strong>. It does not constitute:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Medical advice, diagnosis, or treatment</li>
          <li>A prescription or recommendation for any medication</li>
          <li>A substitute for consultation with a qualified healthcare professional</li>
          <li>An emergency response service</li>
        </ul>
        <h3 className="font-semibold text-gray-900">Always Consult a Professional</h3>
        <p>Always seek the advice of your physician, pharmacist, or other qualified health provider with any questions you may have regarding a medical condition or medication. Never disregard professional medical advice or delay seeking it because of something you have read on MedMed.AI.</p>
        <h3 className="font-semibold text-gray-900">Emergency Situations</h3>
        <p>If you are experiencing a medical emergency, call emergency services (911 in the US) or go to your nearest emergency room immediately. Do not use MedMed.AI for emergencies.</p>
        <h3 className="font-semibold text-gray-900">AI Accuracy</h3>
        <p>AI-generated responses may contain errors, omissions, or outdated information. Medical knowledge evolves continuously. Verify any information with a qualified healthcare professional before making medical decisions.</p>
      </div>
    ),
  },
  cancel: {
    title: "Cancellation Policy",
    body: (
      <div className="space-y-6">
        <h3 className="font-semibold text-gray-900">Cancel Anytime</h3>
        <p>You may cancel your MedMed.AI subscription at any time from your Account settings. There is no cancellation fee and no minimum commitment period.</p>
        <h3 className="font-semibold text-gray-900">What Happens When You Cancel</h3>
        <ul className="list-disc ml-5 space-y-1">
          <li>Your Pro or Max access continues until the end of your current billing period</li>
          <li>You will not be charged for the next period</li>
          <li>Your conversation history and stored documents remain accessible until the period ends</li>
          <li>After expiry, your account reverts to the free tier (5 questions/48 hours)</li>
        </ul>
        <h3 className="font-semibold text-gray-900">No Refund Policy</h3>
        <p>MedMed.AI does not issue refunds for subscription payments. When you subscribe, you gain immediate access to Pro features. Because we provide immediate digital access to the service, all charges are non-refundable.</p>
        <p>If you believe there has been an error in billing, contact <a href="mailto:support@medmed.ai" className="text-primary underline">support@medmed.ai</a> within 7 days.</p>
        <h3 className="font-semibold text-gray-900">How to Cancel</h3>
        <p>Go to <strong>Account → Billing & Plans → Cancel Subscription</strong>, or email <a href="mailto:support@medmed.ai" className="text-primary underline">support@medmed.ai</a>.</p>
      </div>
    ),
  },
  cookies: {
    title: "Cookie Policy",
    body: (
      <div className="space-y-6">
        <h3 className="font-semibold text-gray-900">Our Approach</h3>
        <p>MedMed.AI uses only essential storage mechanisms. We do not use advertising cookies, tracking pixels, or behavioral profiling tools.</p>
        <h3 className="font-semibold text-gray-900">What We Store</h3>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Session token (localStorage):</strong> keeps you signed in</li>
          <li><strong>Sidebar preference (localStorage):</strong> remembers if sidebar is open/closed</li>
          <li><strong>Usage quota (localStorage):</strong> tracks your free question count per 48-hour window</li>
          <li><strong>Language preference (localStorage):</strong> stores your language selection</li>
        </ul>
        <h3 className="font-semibold text-gray-900">Third-Party Storage</h3>
        <p>Stripe (payments) may set cookies on their hosted payment pages per their own privacy policy. Cloudflare may set security cookies on our infrastructure. Neither is used for advertising.</p>
        <h3 className="font-semibold text-gray-900">Managing Storage</h3>
        <p>You can clear localStorage and browser data at any time through your browser settings. Clearing session data will sign you out of MedMed.AI.</p>
      </div>
    ),
  },
  scope: {
    title: "Scope & Devices",
    body: (
      <div className="space-y-6">
        <p>All MedMed.AI policies apply universally across all platforms, devices, and access methods.</p>
        <h3 className="font-semibold text-gray-900">Covered Platforms</h3>
        <ul className="list-disc ml-5 space-y-1">
          <li><strong>Web browsers</strong> (desktop and mobile): Chrome, Firefox, Safari, Edge, and all modern browsers</li>
          <li><strong>Mobile devices</strong>: iOS and Android via mobile browser</li>
          <li><strong>API access</strong> (future): any programmatic access to MedMed.AI services</li>
          <li><strong>Third-party integrations</strong>: any service that connects to MedMed.AI via official channels</li>
        </ul>
        <h3 className="font-semibold text-gray-900">Covered Activities</h3>
        <p>These policies apply to all interactions with MedMed.AI, including:</p>
        <ul className="list-disc ml-5 space-y-1">
          <li>AI queries and conversations</li>
          <li>Account creation and management</li>
          <li>Payment and subscription management</li>
          <li>Document uploads and storage</li>
          <li>Symptom Checker, Pharmacy Finder, and Interaction Checker usage</li>
          <li>Voice input (where available)</li>
          <li>Sponsor and advertiser portal access</li>
        </ul>
        <h3 className="font-semibold text-gray-900">Geographic Scope</h3>
        <p>MedMed.AI is available globally. Users in the European Union have additional rights under GDPR. Users in California have additional rights under CCPA. Contact <a href="mailto:privacy@medmed.ai" className="text-primary underline">privacy@medmed.ai</a> to exercise jurisdiction-specific rights.</p>
        <h3 className="font-semibold text-gray-900">Updates</h3>
        <p>Policy updates apply across all platforms simultaneously. Continued use of any MedMed.AI platform after policy updates constitutes acceptance.</p>
      </div>
    ),
  },
};

/* ─── Policy Center Page ─────────────────────────────────── */
export default function PolicyCenter() {
  const [active, setActive] = useState<SectionId>("privacy");
  const current = content[active];

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Left sidebar */}
      <aside
        className="w-60 flex-shrink-0 border-r sticky top-0 h-screen flex flex-col"
        style={{ backgroundColor: "#f0ebe2", borderColor: "#e0d8cc" }}
      >
        <div className="px-5 pt-8 pb-5 border-b" style={{ borderColor: "#e0d8cc" }}>
          <Link to="/" className="text-[13px] text-gray-500 hover:text-gray-900 block mb-4">← MedMed.AI</Link>
          <h1 className="text-[17px] font-bold text-gray-900">Policy Center</h1>
          <p className="text-[11px] text-gray-500 mt-0.5">Effective {EFFECTIVE_DATE}</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {SECTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-[13.5px] transition-colors mb-0.5 ${
                active === id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-4 border-t text-[11px] text-gray-400" style={{ borderColor: "#d8d0c0" }}>
          Questions? <a href="mailto:support@medmed.ai" className="text-primary underline">support@medmed.ai</a>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0 px-10 py-12 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{current.title}</h2>
        <div className="text-[15px] leading-relaxed text-gray-700">
          {current.body}
        </div>
      </main>
    </div>
  );
}
