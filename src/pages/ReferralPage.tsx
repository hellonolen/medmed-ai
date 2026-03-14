import { useState, useEffect } from "react";
import { toast } from "sonner";

const WORKER = "https://medmed-agent.hellonolen.workers.dev";

interface Referral { referred_email: string; converted: number; created_at: string; }

export default function ReferralPage() {
  const token = localStorage.getItem("medmed_token");
  const [code, setCode] = useState<string | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch(`${WORKER}/api/referral`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json() as Promise<{ referralCode: string; referrals: Referral[] }>)
      .then(d => { setCode(d.referralCode); setReferrals(d.referrals || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const link = code ? `https://medmed.ai/signup?ref=${code}` : "";

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2500);
  };

  const cardStyle = { backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" };
  const converted = referrals.filter(r => r.converted).length;

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-[14px]">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Refer a friend</h1>
        <p className="text-[14px] text-gray-500">
          Every friend you refer who signs up gives you <strong>30 free days</strong> added to your account — automatically.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Referred", value: referrals.length },
          { label: "Converted", value: converted },
          { label: "Days earned", value: converted * 30 },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl p-5 text-center" style={cardStyle}>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-[12px] text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Link */}
      <div className="rounded-2xl p-6 mb-6 space-y-4" style={cardStyle}>
        <h2 className="text-[14px] font-semibold text-gray-900">Your referral link</h2>
        <div className="flex gap-2">
          <input readOnly value={link} className="flex-1 px-4 py-2.5 rounded-xl text-[13px] text-gray-700 outline-none"
            style={{ backgroundColor: "#ede8de", border: "1px solid #d8d0c0" }} />
          <button onClick={copy}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors">
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
        <p className="text-[12px] text-gray-400">
          Share this link. When someone signs up with it, you both benefit — they get full trial access, you get 30 extra days.
        </p>
      </div>

      {/* Referral list */}
      {referrals.length > 0 && (
        <div className="rounded-2xl p-6" style={cardStyle}>
          <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Your referrals</h2>
          <div className="space-y-3">
            {referrals.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-[13px]">
                <span className="text-gray-700">{r.referred_email.replace(/(?<=.{3}).(?=.*@)/g, '•')}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${r.converted ? "text-green-700 bg-green-50" : "text-gray-500 bg-gray-100"}`}>
                  {r.converted ? "Converted" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
