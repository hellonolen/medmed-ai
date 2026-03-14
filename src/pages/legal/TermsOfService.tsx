import { Link } from "react-router-dom";

const EFFECTIVE_DATE = "March 13, 2025";

export default function TermsOfService() {
  return (
    <div style={{ backgroundColor: "#faf8f4", minHeight: "100vh" }}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 mb-8 block">← Back to MedMed.AI</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-[15px] leading-relaxed text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using MedMed.AI ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
            <p>MedMed.AI is an AI-powered healthcare information platform that provides information about medications, symptoms, pharmacies, and healthcare services worldwide. The Service is powered by Google Gemini AI.</p>
            <p className="mt-2 font-medium">MedMed.AI provides information only. It does not provide medical diagnoses, prescriptions, or professional medical advice. Always consult a qualified healthcare professional for medical decisions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Accounts</h2>
            <p>You must be at least 18 years old to create an account. You are responsible for maintaining the confidentiality of your credentials and for all activity under your account. Notify us immediately of any unauthorized use at <a href="mailto:support@medmed.ai" className="text-primary underline">support@medmed.ai</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Free and Pro Plans</h2>
            <p>The free plan allows a limited number of AI queries per 48-hour period. Pro plans are billed monthly at $19/month (Individual) or $79/month (Practice). Pricing is subject to change with 30 days' notice. Pro features include unlimited queries, conversation history, and document storage.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Payments and Billing</h2>
            <p>All payments are processed by Stripe. By subscribing, you authorize recurring charges to your payment method. Subscriptions auto-renew unless cancelled before the renewal date. You may cancel at any time from your account settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Refunds</h2>
            <p>See our <Link to="/refund-policy" className="text-primary underline">Refund Policy</Link> for full details. In summary, we offer a 7-day refund on first-time subscriptions if the service did not function as described.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Prohibited Uses</h2>
            <ul className="list-disc ml-6 space-y-1">
              <li>Use the Service for any unlawful purpose.</li>
              <li>Submit false, misleading, or harmful content.</li>
              <li>Attempt to reverse-engineer, scrape, or overload the Service.</li>
              <li>Impersonate any person or entity.</li>
              <li>Use automated tools to access the Service without authorization.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Intellectual Property</h2>
            <p>All platform content, branding, and technology are owned by MedMed.AI. You retain ownership of content you upload or submit. By submitting queries, you grant us a limited license to process them to provide the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Disclaimers</h2>
            <p>The Service is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or fitness for a particular purpose of any information provided. AI-generated responses may contain errors.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, MedMed.AI shall not be liable for any indirect, incidental, special, or consequential damages. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time from your account settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Governing Law</h2>
            <p>These Terms are governed by the laws of the United States. Disputes shall be resolved through binding arbitration, except for claims subject to small claims court.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Contact</h2>
            <p>MedMed.AI<br />Email: <a href="mailto:support@medmed.ai" className="text-primary underline">support@medmed.ai</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
