import { useState } from "react";
import { Link } from "react-router-dom";
import { SiteNav } from "@/components/SiteNav";
import { toast } from "sonner";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General question");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const inputCls = "w-full px-4 py-2.5 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all";
  const inputStyle = { backgroundColor: "#f0ebe2", border: "1px solid #d8d0c0" };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission — replace with real endpoint when ready
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setSent(true);
    toast.success("Message sent. We'll get back to you shortly.");
  };

  const card = { backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" };

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <SiteNav />
        <div className="flex flex-1 items-center justify-center px-6">
          <div className="text-center max-w-sm">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: "#ede8de" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L20 7" stroke="#4a4035" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h1 className="text-[24px] font-bold text-gray-900 mb-3">Message received</h1>
            <p className="text-[15px] text-gray-500 mb-8">We'll respond to <strong>{email}</strong> as soon as we can.</p>
            <Link to="/" className="text-[14px] text-primary hover:underline">← Back to home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <SiteNav />
      <div className="max-w-5xl mx-auto px-6 py-16 w-full grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Left */}
        <div>
          <h1 className="text-[36px] font-bold text-gray-900 tracking-tight mb-4">Get in touch</h1>
          <p className="text-[16px] text-gray-500 leading-relaxed mb-10">
            Have a question, feedback, or issue with your account? Fill out the form and we'll get back to you.
          </p>
          <div className="space-y-5">
            {[
              { title: "Account & billing", body: "Questions about your plan, charges, or account access." },
              { title: "Technical support", body: "Something not working the way it should? Tell us what happened." },
              { title: "General feedback", body: "Tell us what you love, what's missing, or what's confusing." },
            ].map(({ title, body }) => (
              <div key={title} className="rounded-2xl p-5" style={card}>
                <p className="text-[14px] font-semibold text-gray-900 mb-1">{title}</p>
                <p className="text-[13px] text-gray-500">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="rounded-2xl p-8" style={card}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5" htmlFor="c-name">Name</label>
              <input id="c-name" required value={name} onChange={e => setName(e.target.value)} placeholder="Your name" className={inputCls} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5" htmlFor="c-email">Email</label>
              <input id="c-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={inputCls} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5" htmlFor="c-subject">Subject</label>
              <select id="c-subject" value={subject} onChange={e => setSubject(e.target.value)} className={inputCls} style={inputStyle}>
                {["General question", "Account & billing", "Technical support", "Feature request", "Other"].map(s => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5" htmlFor="c-message">Message</label>
              <textarea id="c-message" required rows={5} value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind..." className={`${inputCls} resize-none`} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 mt-1">
              {loading ? "Sending..." : "Send message"}
            </button>
          </form>
          <p className="text-[12px] text-gray-400 text-center mt-4">
            We typically respond within 1 business day.
          </p>
        </div>
      </div>

      <footer className="border-t px-6 py-5 mt-auto" style={{ borderColor: "#e0d8cc", backgroundColor: "#f0ebe2" }}>
        <div className="max-w-5xl mx-auto flex justify-between items-center text-[12px] text-gray-400">
          <span>© {new Date().getFullYear()} MedMed.AI</span>
          <Link to="/policy" className="hover:text-gray-700 transition-colors">Policy Center</Link>
        </div>
      </footer>
    </div>
  );
}
