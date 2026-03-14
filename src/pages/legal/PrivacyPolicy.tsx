import { Link } from "react-router-dom";

const EFFECTIVE_DATE = "March 13, 2025";

export default function PrivacyPolicy() {
  return (
    <div style={{ backgroundColor: "#faf8f4", minHeight: "100vh" }}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 mb-8 block">← Back to MedMed.AI</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-[15px] leading-relaxed text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Who We Are</h2>
            <p>MedMed.AI ("we," "us," or "our") operates the MedMed.AI platform, a global healthcare information service powered by artificial intelligence. Our registered contact email is <a href="mailto:privacy@medmed.ai" className="text-primary underline">privacy@medmed.ai</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p>We collect the following categories of information:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li><strong>Account information</strong>: name, email address, and encrypted password when you create an account.</li>
              <li><strong>Usage data</strong>: queries submitted to the platform, conversation history (for Pro subscribers), and feature interactions.</li>
              <li><strong>Payment information</strong>: processed exclusively through Stripe. We do not store card numbers or banking details.</li>
              <li><strong>Device and log data</strong>: IP address, browser type, and access timestamps for security and analytics.</li>
              <li><strong>Uploaded documents</strong> (Pro): files you upload to your storage library are stored in Cloudflare R2 and are private to your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>To provide, personalize, and improve the MedMed.AI service.</li>
              <li>To process subscription payments and manage your account.</li>
              <li>To send transactional emails (account confirmation, password reset, billing receipts).</li>
              <li>To detect fraud, abuse, or security threats.</li>
              <li>To comply with applicable laws and regulations.</li>
            </ul>
            <p className="mt-3">We do not sell your personal information to third parties. We do not use your queries to train AI models without explicit consent.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Query Processing</h2>
            <p>Queries submitted to MedMed.AI are processed securely through our backend infrastructure. We do not include personally identifiable information in query prompts beyond what you explicitly type. Responses are for informational purposes only and do not constitute medical advice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Retention</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Account data is retained until you request deletion.</li>
              <li>Conversation history (Pro) is retained for 90 days, then automatically exported to your storage library.</li>
              <li>Uploaded documents remain until you delete them or close your account.</li>
              <li>Log data is retained for 30 days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Data Security</h2>
            <p>All data is transmitted over TLS. Account passwords are hashed using PBKDF2 with SHA-256. Authentication uses secure JWT tokens. Our infrastructure runs on Cloudflare's global network with SOC 2 compliance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or export your personal data. To exercise these rights, email <a href="mailto:privacy@medmed.ai" className="text-primary underline">privacy@medmed.ai</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cookies</h2>
            <p>We use essential cookies to maintain your session. We do not use advertising or tracking cookies. See our <Link to="/cookie-policy" className="text-primary underline">Cookie Policy</Link> for details.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Children's Privacy</h2>
            <p>MedMed.AI is not directed at children under 13. We do not knowingly collect personal information from minors. If you believe a minor has provided us data, contact privacy@medmed.ai immediately.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p>We may update this policy from time to time. Material changes will be communicated via email to registered users. Continued use after changes constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact</h2>
            <p>MedMed.AI<br />Email: <a href="mailto:privacy@medmed.ai" className="text-primary underline">privacy@medmed.ai</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
