import { Link } from "react-router-dom";

const EFFECTIVE_DATE = "March 13, 2025";

export default function RefundPolicy() {
  return (
    <div style={{ backgroundColor: "#faf8f4", minHeight: "100vh" }}>
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 mb-8 block">← Back to MedMed.AI</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Effective date: {EFFECTIVE_DATE}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-[15px] leading-relaxed text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7-Day Satisfaction Guarantee</h2>
            <p>If you subscribe to MedMed.AI Pro for the first time and the service did not perform as described, we will issue a full refund within 7 days of your initial payment — no questions asked.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">How to Request a Refund</h2>
            <p>Email <a href="mailto:support@medmed.ai" className="text-primary underline">support@medmed.ai</a> with:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Your registered email address</li>
              <li>The approximate date of purchase</li>
              <li>A brief description of the issue</li>
            </ul>
            <p className="mt-3">We will process approved refunds within 5–10 business days to your original payment method.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Renewals</h2>
            <p>Monthly subscription renewals are not eligible for refunds after the renewal date has passed. To avoid a renewal charge, cancel your subscription at least 24 hours before your next billing date from your Account settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Cancellation</h2>
            <p>You may cancel your subscription at any time from your Account Center. After cancellation, you retain Pro access until the end of your current billing period. No partial refunds are issued for unused days in the current period.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Exceptions</h2>
            <p>Refunds will not be issued for:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Renewals processed after the cancellation deadline</li>
              <li>Accounts terminated for violations of our Terms of Service</li>
              <li>Requests submitted more than 7 days after the initial purchase</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Contact</h2>
            <p>MedMed.AI<br />Email: <a href="mailto:support@medmed.ai" className="text-primary underline">support@medmed.ai</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
