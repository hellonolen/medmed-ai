import { useState, useEffect } from "react";
import { toast } from "sonner";

const WORKER = "https://medmed-agent.hellonolen.workers.dev";

interface Med { id: string; name: string; dosage?: string; frequency?: string; time_of_day?: string; notes?: string; }
interface Log { medication_id: string; name: string; taken_at: string; }

export default function MedicationTracker() {
  const token = localStorage.getItem("medmed_token");
  const [meds, setMeds] = useState<Med[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", frequency: "", time_of_day: "morning", notes: "" });

  const hdrs = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const load = async () => {
    try {
      const [m, l] = await Promise.all([
        fetch(`${WORKER}/api/medications`, { headers: hdrs }).then(r => r.json() as Promise<{ medications: Med[] }>),
        fetch(`${WORKER}/api/medications/log`, { headers: hdrs }).then(r => r.json() as Promise<{ logs: Log[] }>),
      ]);
      setMeds(m.medications || []);
      setLogs(l.logs || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { if (token) load(); }, [token]);

  const addMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setAdding(true);
    try {
      await fetch(`${WORKER}/api/medications`, { method: "POST", headers: hdrs, body: JSON.stringify(form) });
      toast.success(`${form.name} added to your tracker.`);
      setForm({ name: "", dosage: "", frequency: "", time_of_day: "morning", notes: "" });
      await load();
    } catch { toast.error("Failed to add."); }
    setAdding(false);
  };

  const logTaken = async (medId: string, medName: string) => {
    try {
      await fetch(`${WORKER}/api/medications/log`, { method: "POST", headers: hdrs, body: JSON.stringify({ medication_id: medId }) });
      toast.success(`Logged: ${medName} taken.`);
      await load();
    } catch { toast.error("Failed to log."); }
  };

  const removeMed = async (medId: string) => {
    try {
      await fetch(`${WORKER}/api/medications?id=${medId}`, { method: "DELETE", headers: hdrs });
      toast.success("Medication removed.");
      await load();
    } catch { toast.error("Failed to remove."); }
  };

  const cardStyle = { backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" };
  const inputCls = "w-full px-4 py-2.5 rounded-xl text-[13px] text-gray-900 outline-none transition-all";
  const inputStyle = { backgroundColor: "#f0ebe2", border: "1px solid #d8d0c0" };

  // Was this med logged today?
  const today = new Date().toDateString();
  const takenToday = new Set(logs.filter(l => new Date(l.taken_at).toDateString() === today).map(l => l.medication_id));

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-[14px]">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Medication Tracker</h1>
        <p className="text-[14px] text-gray-500">Track what you take and when. Log each dose as you take it.</p>
      </div>

      {/* Today's status */}
      {meds.length > 0 && (
        <section className="rounded-2xl p-6 mb-6" style={cardStyle}>
          <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Today</h2>
          <div className="space-y-3">
            {meds.map(med => (
              <div key={med.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-gray-900 truncate">{med.name}</p>
                  <p className="text-[12px] text-gray-400">{[med.dosage, med.frequency, med.time_of_day].filter(Boolean).join(" · ")}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {takenToday.has(med.id)
                    ? <span className="text-[12px] font-semibold text-green-700 bg-green-50 px-3 py-1.5 rounded-full">Taken ✓</span>
                    : <button onClick={() => logTaken(med.id, med.name)}
                        className="text-[12px] font-semibold text-primary border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/5 transition-colors">
                        Log taken
                      </button>}
                  <button onClick={() => removeMed(med.id)} className="text-[12px] text-gray-300 hover:text-red-400 transition-colors">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Add medication */}
      <section className="rounded-2xl p-6 mb-6" style={cardStyle}>
        <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Add medication</h2>
        <form onSubmit={addMed} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input placeholder="Medication name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className={inputCls} style={inputStyle} required
                onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
            </div>
            <input placeholder="Dosage (e.g. 10mg)" value={form.dosage} onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
              className={inputCls} style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
            <input placeholder="Frequency (e.g. once daily)" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))}
              className={inputCls} style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
            <select value={form.time_of_day} onChange={e => setForm(f => ({ ...f, time_of_day: e.target.value }))}
              className={inputCls} style={inputStyle}>
              {["morning", "afternoon", "evening", "bedtime"].map(t => <option key={t}>{t}</option>)}
            </select>
            <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className={inputCls} style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "#7c3aed")} onBlur={e => (e.target.style.borderColor = "#d8d0c0")} />
          </div>
          <button type="submit" disabled={adding}
            className="w-full py-2.5 rounded-xl bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
            {adding ? "Adding…" : "Add medication"}
          </button>
        </form>
      </section>

      {/* Recent log */}
      {logs.length > 0 && (
        <section className="rounded-2xl p-6" style={cardStyle}>
          <h2 className="text-[14px] font-semibold text-gray-900 mb-4">Recent log</h2>
          <div className="space-y-2">
            {logs.slice(0, 20).map((l, i) => (
              <div key={i} className="flex items-center justify-between text-[13px]">
                <span className="text-gray-700 font-medium">{l.name}</span>
                <span className="text-gray-400">{new Date(l.taken_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
