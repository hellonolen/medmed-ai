import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const WORKER = "https://medmed-agent.hellonolen.workers.dev";

interface HealthProfile {
  age?: number; sex?: string; weight_lbs?: number; height_in?: number;
  conditions: string[]; allergies: string[]; current_meds: string[]; notes?: string;
}

function TagInput({ label, items, onChange }: { label: string; items: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !items.includes(v)) { onChange([...items, v]); setInput(""); }
  };
  return (
    <div>
      <label className="block text-[13px] font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2 mb-2 flex-wrap">
        {items.map(item => (
          <span key={item} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium text-gray-700"
            style={{ backgroundColor: "#e4ddd0" }}>
            {item}
            <button type="button" onClick={() => onChange(items.filter(i => i !== item))} className="text-gray-400 hover:text-gray-700 leading-none">&times;</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={`Add ${label.toLowerCase()}...`}
          className="flex-1 px-4 py-2 rounded-xl text-[13px] outline-none"
          style={{ backgroundColor: "#f0ebe2", border: "1px solid #d8d0c0" }}
          onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
        <button type="button" onClick={add} className="px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors">
          Add
        </button>
      </div>
    </div>
  );
}

export default function HealthProfile() {
  const { user } = useAuth();
  const token = localStorage.getItem("medmed_token");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<HealthProfile>({ conditions: [], allergies: [], current_meds: [] });

  useEffect(() => {
    if (!token) return;
    fetch(`${WORKER}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json() as Promise<{ profile: HealthProfile | null }>)
      .then(d => { if (d.profile) setProfile(d.profile); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      await fetch(`${WORKER}/api/profile`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      toast.success("Health profile saved. The AI will now use this context in every conversation.");
    } catch { toast.error("Failed to save."); }
    finally { setSaving(false); }
  };

  const cardStyle = { backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" };
  const inputCls = "w-full px-4 py-2.5 rounded-xl text-[14px] text-gray-900 placeholder:text-gray-400 outline-none transition-all";
  const inputStyle = { backgroundColor: "#f0ebe2", border: "1px solid #d8d0c0" };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-[14px]">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Health Profile</h1>
        <p className="text-[14px] text-gray-500">
          This information is saved securely and shared with the AI in every conversation to give you more relevant, personalized answers.
        </p>
      </div>

      <form onSubmit={save} className="space-y-6">
        {/* Basic info */}
        <section className="rounded-2xl p-6" style={cardStyle}>
          <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Basic information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Age</label>
              <input type="number" value={profile.age || ""} onChange={e => setProfile(p => ({ ...p, age: Number(e.target.value) || undefined }))}
                placeholder="35" className={inputCls} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Biological sex</label>
              <select value={profile.sex || ""} onChange={e => setProfile(p => ({ ...p, sex: e.target.value }))}
                className={inputCls} style={inputStyle}>
                <option value="">Prefer not to say</option>
                <option>Male</option><option>Female</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Weight (lbs)</label>
              <input type="number" value={profile.weight_lbs || ""} onChange={e => setProfile(p => ({ ...p, weight_lbs: Number(e.target.value) || undefined }))}
                placeholder="160" className={inputCls} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Height (inches)</label>
              <input type="number" value={profile.height_in || ""} onChange={e => setProfile(p => ({ ...p, height_in: Number(e.target.value) || undefined }))}
                placeholder="68" className={inputCls} style={inputStyle}
                onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
            </div>
          </div>
        </section>

        {/* Conditions, allergies, meds */}
        <section className="rounded-2xl p-6 space-y-6" style={cardStyle}>
          <h2 className="text-[14px] font-semibold text-gray-900">Medical history</h2>
          <TagInput label="Known conditions" items={profile.conditions} onChange={v => setProfile(p => ({ ...p, conditions: v }))} />
          <TagInput label="Allergies" items={profile.allergies} onChange={v => setProfile(p => ({ ...p, allergies: v }))} />
          <TagInput label="Current medications" items={profile.current_meds} onChange={v => setProfile(p => ({ ...p, current_meds: v }))} />
        </section>

        {/* Notes */}
        <section className="rounded-2xl p-6" style={cardStyle}>
          <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Additional notes</h2>
          <textarea rows={4} value={profile.notes || ""} onChange={e => setProfile(p => ({ ...p, notes: e.target.value }))}
            placeholder="Anything else you want the AI to know about your health..."
            className={`${inputCls} resize-none`} style={inputStyle}
            onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
        </section>

        <div className="flex items-center justify-between">
          <p className="text-[12px] text-gray-400">This profile is only used to personalize AI responses. It is never shared.</p>
          <button type="submit" disabled={saving}
            className="px-6 py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
            {saving ? "Saving…" : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
