import { Link } from "react-router-dom";

const EFFECTIVE_DATE = "March 13, 2025";

export default function CookiePolicy() {
  return (
    <div style={{ backgroundColor: "#faf8f4", minHeight: "100vh" }}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 mb-8 block">← Back to MedMed.AI</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookie Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-[15px] leading-relaxed text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">What Are Cookies</h2>
            <p>Cookies are small text files stored on your device by your web browser. They help websites remember your preferences and maintain your session.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Cookies We Use</h2>
            <p>MedMed.AI uses only <strong>essential cookies</strong>:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Session authentication</strong>: keeps you signed in across page loads (JWT stored in localStorage, not a cookie directly)</li>
              <li><strong>Preference storage</strong>: sidebar state, language preference — stored in localStorage</li>
              <li><strong>Usage quota</strong>: tracks your free question count with a 48-hour window — stored in localStorage</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">What We Do Not Use</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Advertising cookies or tracking pixels</li>
              <li>Third-party analytics (e.g., Google Analytics)</li>
              <li>Social media tracking cookies</li>
              <li>Behavioral profiling</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Third-Party Services</h2>
            <p>Stripe (payments) may set cookies on their hosted payment pages. These are subject to <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline">Stripe's Privacy Policy</a>. Cloudflare may set cookies for security and performance purposes on our infrastructure.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Managing Cookies</h2>
            <p>You can clear localStorage and cookies at any time through your browser settings. Note that clearing session data will sign you out. Because we only use essential storage, disabling cookies may affect core functionality.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
            <p>Questions? Email <a href="mailto:privacy@medmed.ai" className="text-primary underline">privacy@medmed.ai</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
