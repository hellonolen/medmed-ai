import { useState } from "react";
import { Link } from "react-router-dom";
import { findMatchingSymptoms, medicalConditions } from "@/data/symptoms";
import { toast } from "sonner";
import { aiService } from "@/services/AIService";

const COMMON_SYMPTOMS = [
  "Headache","Fever","Cough","Fatigue","Nausea",
  "Dizziness","Sore Throat","Rash","Back Pain","Abdominal Pain",
  "Chest Pain","Shortness of Breath","Joint Pain","Muscle Pain",
  "Diarrhea","Constipation","Blurred Vision","Itching","Swelling",
];

interface Condition {
  name: string;
  probability: number;
  description: string;
  symptoms: string[];
  specialists: string[];
}

const SymptomChecker = () => {
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [custom, setCustom] = useState("");
  const [results, setResults] = useState<Condition[]>([]);
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = (s: string) =>
    setSelected((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  const addCustom = () => {
    if (!custom.trim()) return;
    if (selected.includes(custom.trim())) { toast.error("Already added"); return; }
    setSelected((p) => [...p, custom.trim()]);
    setCustom("");
  };

  const analyze = async () => {
    if (!selected.length) { toast.error("Select at least one symptom"); return; }
    setLoading(true);
    try {
      const matches: Record<string, { count: number; symptoms: string[]; specialists: string[] }> = {};
      selected.forEach((sym) => {
        findMatchingSymptoms(sym).forEach((m) =>
          m.relatedConditions.forEach((cond) => {
            const mc = medicalConditions.find((c) => c.category === cond);
            if (mc) {
              if (!matches[cond]) matches[cond] = { count: 0, symptoms: mc.symptoms, specialists: mc.specialists };
              matches[cond].count++;
            }
          })
        );
      });

      const conditions: Condition[] = Object.entries(matches)
        .map(([name, m]) => ({
          name,
          probability: Math.min(Math.round((m.count / Math.max(selected.length, 2)) * 100), 95),
          description: `Typically involves ${m.symptoms.slice(0, 3).join(", ")}${m.symptoms.length > 3 ? ", and more" : ""}`,
          symptoms: m.symptoms,
          specialists: m.specialists,
        }))
        .sort((a, b) => b.probability - a.probability)
        .slice(0, 5);

      setResults(conditions);

      const res = await aiService.askAI({
        query: `Analyze these symptoms: ${selected.join(", ")}. What might they indicate and what specialist should I see?`,
        systemPrompt: "You are a healthcare information assistant. Give concise, balanced information (max 3 paragraphs). Always include a disclaimer that this is not medical advice.",
      });
      setAnalysis(res.success ? res.content : "");
      setStep(2);
    } catch {
      toast.error("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const restart = () => { setSelected([]); setResults([]); setAnalysis(""); setStep(1); };

  const card = "rounded-2xl border p-5 mb-5";
  const cardStyle = { backgroundColor: "#fdf9f2", borderColor: "#e0d8cc" };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Symptom Checker</h1>
      <p className="text-[14px] text-gray-500 mb-8">
        {step === 1 ? "Select your symptoms to see possible conditions." : "Based on your symptoms, here are possible conditions."}
      </p>

      {step === 1 ? (
        <>
          {/* Selected */}
          <div className={card} style={cardStyle}>
            <h2 className="text-[14px] font-semibold text-gray-700 mb-3">
              Selected ({selected.length})
            </h2>
            {selected.length === 0 ? (
              <p className="text-[13px] text-gray-400 italic">None selected yet</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-3">
                {selected.map((s) => (
                  <span key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] text-gray-700" style={{ backgroundColor: "#e8e0d0" }}>
                    {s}
                    <button onClick={() => toggle(s)} className="text-gray-400 hover:text-gray-900 leading-none">&times;</button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <input
                type="text"
                placeholder="Add custom symptom..."
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addCustom()}
                className="flex-1 px-3 py-2 rounded-xl text-[13px] text-gray-900 placeholder:text-gray-400 outline-none"
                style={{ backgroundColor: "#f0ebe2", border: "1px solid #d8d0c0" }}
              />
              <button onClick={addCustom} className="px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors">
                Add
              </button>
            </div>
          </div>

          {/* Common */}
          <div className={card} style={cardStyle}>
            <h2 className="text-[14px] font-semibold text-gray-700 mb-4">Common Symptoms</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COMMON_SYMPTOMS.map((s) => (
                <label key={s} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selected.includes(s)}
                    onChange={() => toggle(s)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-[13px] text-gray-700">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={analyze}
              disabled={!selected.length || loading}
              className="px-8 py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {loading ? "Analyzing..." : "Analyze Symptoms"}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Disclaimer */}
          <div className="rounded-2xl p-4 mb-6 text-[13px] text-amber-800" style={{ backgroundColor: "#fffbe6", border: "1px solid #f0d060" }}>
            <strong>Important:</strong> This tool provides general information only. It is not a diagnosis. Always consult a qualified healthcare professional.
          </div>

          {/* Analysis */}
          {analysis && (
            <div className={card} style={cardStyle}>
              <h2 className="text-[14px] font-semibold text-gray-700 mb-3">Overview</h2>
              <div className="text-[14px] text-gray-700 leading-relaxed space-y-2">
                {analysis.split("\n").filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </div>
          )}

          {/* Your symptoms */}
          <div className="mb-5">
            <p className="text-[13px] font-semibold text-gray-600 mb-2">Your symptoms:</p>
            <div className="flex flex-wrap gap-2">
              {selected.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full text-[12px] text-gray-700" style={{ backgroundColor: "#e8e0d0" }}>{s}</span>
              ))}
            </div>
          </div>

          {/* Results */}
          <h2 className="text-[16px] font-bold text-gray-900 mb-4">Possible Conditions</h2>
          <div className="space-y-4 mb-8">
            {results.length === 0 ? (
              <p className="text-[14px] text-gray-500">No matching conditions found.</p>
            ) : results.map((c) => (
              <div key={c.name} className={card} style={cardStyle}>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[15px] font-semibold text-gray-900">{c.name}</h3>
                  <span className={`text-[12px] font-medium px-2.5 py-0.5 rounded-full ${c.probability >= 70 ? "bg-red-100 text-red-700" : c.probability >= 40 ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                    {c.probability >= 70 ? "High" : c.probability >= 40 ? "Moderate" : "Low"} match
                  </span>
                </div>
                <p className="text-[13px] text-gray-600 mb-3">{c.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {c.symptoms.slice(0, 6).map((s) => (
                    <span key={s} className={`text-[11px] px-2 py-0.5 rounded ${selected.includes(s) ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-600"}`}>{s}</span>
                  ))}
                </div>
                {c.specialists.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {c.specialists.map((sp) => (
                      <span key={sp} className="text-[11px] px-2 py-0.5 rounded bg-blue-50 text-blue-700">{sp}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={restart} className="px-6 py-2.5 rounded-xl text-[13px] font-medium text-gray-700 transition-colors" style={{ backgroundColor: "#e8e0d0" }}>
              Start over
            </button>
            <Link to="/" className="px-6 py-2.5 rounded-xl bg-primary text-white text-[13px] font-medium hover:bg-primary/90 transition-colors">
              Ask a question
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default SymptomChecker;
