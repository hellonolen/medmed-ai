import { useState, useEffect } from "react";
import { toast } from "sonner";

const WORKER = "https://medmed-agent.hellonolen.workers.dev";

interface JournalEntry { id: string; symptoms: string[]; severity?: number; notes?: string; logged_at: string; }

const COMMON_SYMPTOMS = ["Headache", "Fatigue", "Nausea", "Fever", "Cough", "Shortness of breath", "Chest pain", "Dizziness", "Joint pain", "Muscle aches"];

export default function SymptomJournal() {
  const token = localStorage.getItem("medmed_token");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState("");
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState("");

  const hdrs = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    try {
      const d = await fetch(`${WORKER}/api/journal`, { headers: hdrs }).then(r => r.json() as Promise<{ logs: JournalEntry[] }>);
      setEntries(d.logs || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { if (token) load(); }, [token]);

  const toggleSymptom = (s: string) => setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const addCustom = () => {
    const v = customSymptom.trim();
    if (v && !symptoms.includes(v)) { setSymptoms(p => [...p, v]); setCustomSymptom(""); }
  };

  const submitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.length) { toast.error("Add at least one symptom."); return; }
    setSaving(true);
    try {
      await fetch(`${WORKER}/api/journal`, { method: "POST", headers: hdrs, body: JSON.stringify({ symptoms, severity, notes }) });
      toast.success("Entry logged.");
      setSymptoms([]); setNotes(""); setSeverity(5);
      await load();
    } catch { toast.error("Failed to save."); }
    setSaving(false);
  };

  const cardStyle = { backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-[14px]">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Symptom Journal</h1>
        <p className="text-[14px] text-gray-500">Log how you feel over time. Bring this timeline to your next appointment.</p>
      </div>

      {/* Log new entry */}
      <form onSubmit={submitEntry} className="rounded-2xl p-6 mb-6 space-y-5" style={cardStyle}>
        <h2 className="text-[14px] font-semibold text-gray-900">Log today's symptoms</h2>

        {/* Quick-pick */}
        <div>
          <p className="text-[12px] font-medium text-gray-500 mb-2 uppercase tracking-wide">Quick add</p>
          <div className="flex flex-wrap gap-2">
            {COMMON_SYMPTOMS.map(s => (
              <button key={s} type="button" onClick={() => toggleSymptom(s)}
                className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${symptoms.includes(s) ? "bg-primary text-white" : "text-gray-600 hover:bg-[#e4ddd0]"}`}
                style={symptoms.includes(s) ? {} : { backgroundColor: "#ede8de" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Custom */}
        <div className="flex gap-2">
          <input value={customSymptom} onChange={e => setCustomSymptom(e.target.value)}
            onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addCustom())}
            placeholder="Other symptom..."
            className="flex-1 px-4 py-2 rounded-xl text-[13px] outline-none"
            style={{ backgroundColor: "#f0ebe2", border: "1px solid #d8d0c0" }}
            onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
          <button type="button" onClick={addCustom} className="px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-semibold">Add</button>
        </div>

        {/* Selected */}
        {symptoms.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {symptoms.map(s => (
              <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium text-primary"
                style={{ backgroundColor: "rgba(124,58,237,0.1)" }}>
                {s}
                <button type="button" onClick={() => toggleSymptom(s)} className="hover:text-red-500">&times;</button>
              </span>
            ))}
          </div>
        )}

        {/* Severity */}
        <div>
          <label className="block text-[13px] font-medium text-gray-700 mb-2">Severity: <strong>{severity}/10</strong></label>
          <input type="range" min={1} max={10} value={severity} onChange={e => setSeverity(Number(e.target.value))}
            className="w-full accent-primary" />
          <div className="flex justify-between text-[11px] text-gray-400 mt-1">
            <span>Mild</span><span>Moderate</span><span>Severe</span>
          </div>
        </div>

        {/* Notes */}
        <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Any additional notes..."
          className="w-full px-4 py-2.5 rounded-xl text-[13px] outline-none resize-none"
          style={{ backgroundColor: "#f0ebe2", border: "1px solid #d8d0c0" }}
          onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />

        <button type="submit" disabled={saving}
          className="w-full py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
          {saving ? "Saving…" : "Log entry"}
        </button>
      </form>

      {/* History */}
      {entries.length > 0 && (
        <section className="rounded-2xl p-6" style={cardStyle}>
          <h2 className="text-[14px] font-semibold text-gray-900 mb-4">History</h2>
          <div className="space-y-4">
            {entries.map(e => (
              <div key={e.id} className="border-b last:border-0 pb-4 last:pb-0" style={{ borderColor: "#e0d8cc" }}>
                <div className="flex items-start justify-between gap-4 mb-1">
                  <div className="flex flex-wrap gap-1.5">
                    {e.symptoms.map(s => (
                      <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-medium text-gray-600" style={{ backgroundColor: "#e4ddd0" }}>{s}</span>
                    ))}
                  </div>
                  {e.severity && <span className="text-[11px] text-gray-400 flex-shrink-0">Severity {e.severity}/10</span>}
                </div>
                {e.notes && <p className="text-[12px] text-gray-500 mt-1">{e.notes}</p>}
                <p className="text-[11px] text-gray-300 mt-1">{new Date(e.logged_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
