import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const WORKER = "https://medmed-agent.hellonolen.workers.dev";

const MODELS = [
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", desc: "Fastest, lowest cost — default", badge: "Fast" },
  { id: "gemini-2.0-flash-thinking-exp", label: "Gemini 2.0 Flash Thinking", desc: "Multi-step reasoning for complex health questions", badge: "Reasoning" },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", desc: "Highest quality, larger context window", badge: "Pro" },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", desc: "Balanced speed and quality", badge: "Balanced" },
];

interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  activeToday: number;
  proUsers: number;
  freeUsers: number;
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  tier: string;
  created_at: string;
  trial_expires_at: string;
}

interface AdminConfig {
  activeModel: string;
}

export default function AdminCenter() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authToken, setAuthToken] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [config, setConfig] = useState<AdminConfig>({ activeModel: "gemini-2.0-flash" });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "models" | "config">("overview");
  const [modelSaving, setModelSaving] = useState(false);

  const hdrs = useCallback(() => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${authToken}`,
  }), [authToken]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      const res = await fetch(`${WORKER}/api/admin/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: password }),
      });
      const d = await res.json() as { token?: string; error?: string };
      if (!res.ok || !d.token) throw new Error(d.error || "Invalid credentials");
      setAuthToken(d.token);
      setAuthed(true);
      toast.success("Welcome to the admin center");
    } catch (e: unknown) {
      toast.error((e as Error).message || "Authentication failed");
    }
    setAuthLoading(false);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, configRes] = await Promise.all([
        fetch(`${WORKER}/api/admin/stats`, { headers: hdrs() }),
        fetch(`${WORKER}/api/admin/users`, { headers: hdrs() }),
        fetch(`${WORKER}/api/admin/config`, { headers: hdrs() }),
      ]);
      const [s, u, c] = await Promise.all([
        statsRes.json() as Promise<{ stats: AdminStats }>,
        usersRes.json() as Promise<{ users: AdminUser[] }>,
        configRes.json() as Promise<{ config: AdminConfig }>,
      ]);
      if (s.stats) setStats(s.stats);
      if (u.users) setUsers(u.users);
      if (c.config) setConfig(c.config);
    } catch { toast.error("Failed to load admin data"); }
    setLoading(false);
  }, [hdrs]);

  useEffect(() => {
    if (authed) loadData();
  }, [authed, loadData]);

  const setModel = async (modelId: string) => {
    setModelSaving(true);
    try {
      await fetch(`${WORKER}/api/admin/config`, {
        method: "POST",
        headers: hdrs(),
        body: JSON.stringify({ activeModel: modelId }),
      });
      setConfig({ activeModel: modelId });
      toast.success(`Switched to ${modelId}`);
    } catch { toast.error("Failed to switch model"); }
    setModelSaving(false);
  };

  const card = { backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" };
  const inputStyle = { backgroundColor: "#f0ebe2", border: "1px solid #d8d0c0" };

  // ── Login screen
  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#faf8f4" }}>
      <div className="w-full max-w-sm rounded-2xl p-8" style={card}>
        <div className="mb-6 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.75" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Admin Center</h1>
          <p className="text-[13px] text-gray-500 mt-1">MedMed.AI platform management</p>
        </div>
        <form onSubmit={login} className="space-y-4">
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl text-[14px] text-gray-900 outline-none"
            style={inputStyle}
            autoFocus
            required
          />
          <button type="submit" disabled={authLoading || !password}
            className="w-full py-3 rounded-xl bg-gray-900 text-white text-[14px] font-semibold hover:bg-gray-800 transition-colors disabled:opacity-40">
            {authLoading ? "Verifying…" : "Enter Admin Center"}
          </button>
        </form>
        <button onClick={() => navigate("/")} className="w-full text-center text-[12px] text-gray-400 mt-4 hover:text-gray-600 transition-colors">
          ← Back to site
        </button>
      </div>
    </div>
  );

  // ── Admin dashboard
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top bar */}
      <header className="border-b px-6 py-4 flex items-center justify-between" style={{ backgroundColor: "#f0ebe2", borderColor: "#e0d8cc" }}>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gray-900 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <span className="text-[15px] font-bold text-gray-900">MedMed Admin</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">Live</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={loadData} disabled={loading} className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">
            {loading ? "Refreshing…" : "↻ Refresh"}
          </button>
          <button onClick={() => navigate("/chat")} className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">
            ← Chat
          </button>
          <button onClick={() => { setAuthed(false); setAuthToken(""); }}
            className="text-[13px] text-red-500 hover:text-red-700 transition-colors">
            Sign out
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b px-6" style={{ backgroundColor: "#f0ebe2", borderColor: "#e0d8cc" }}>
        <div className="flex gap-0">
          {(["overview", "users", "models", "config"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-[13px] font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? "border-gray-900 text-gray-900" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
              {tab === "models" ? "LLM Models" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Overview ── */}
        {activeTab === "overview" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Overview</h2>
            {!stats ? (
              <div className="text-[14px] text-gray-400">Loading stats…</div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: "Total Users", value: stats.totalUsers?.toLocaleString() ?? "—" },
                    { label: "Questions Asked", value: stats.totalQuestions?.toLocaleString() ?? "—" },
                    { label: "Pro Users", value: stats.proUsers?.toLocaleString() ?? "—" },
                    { label: "Free Users", value: stats.freeUsers?.toLocaleString() ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-2xl p-5" style={card}>
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                      <p className="text-[12px] text-gray-400 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl p-5" style={card}>
                  <p className="text-[13px] font-semibold text-gray-700 mb-1">Active LLM Model</p>
                  <p className="text-[15px] font-medium text-gray-900">{config.activeModel}</p>
                  <p className="text-[12px] text-gray-400 mt-1">
                    {MODELS.find(m => m.id === config.activeModel)?.desc}
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Users ── */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Users ({users.length})</h2>
            <div className="rounded-2xl overflow-hidden" style={card}>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="border-b" style={{ borderColor: "#e0d8cc", backgroundColor: "#f0ebe2" }}>
                    {["Email", "Name", "Plan", "Joined", "Trial Expires"].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-gray-600 text-[11px] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-[#f0ebe2] transition-colors" style={{ borderColor: "#e0d8cc" }}>
                      <td className="px-4 py-3 text-gray-900">{u.email}</td>
                      <td className="px-4 py-3 text-gray-600">{u.name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.tier === "premium" ? "bg-primary/10 text-primary" :
                          u.tier === "business" ? "bg-yellow-100 text-yellow-700" :
                          u.tier === "enterprise" ? "bg-green-100 text-green-700" :
                          "bg-gray-100 text-gray-500"
                        }`}>{u.tier}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{u.trial_expires_at ? new Date(u.trial_expires_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="text-[13px] text-gray-400 text-center py-8">No users yet.</p>
              )}
            </div>
          </div>
        )}

        {/* ── LLM Models ── */}
        {activeTab === "models" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">LLM Model Selection</h2>
              <p className="text-[14px] text-gray-500">Choose the Gemini model that powers all AI responses on the platform. Changes take effect immediately for all users.</p>
            </div>
            <div className="space-y-3">
              {MODELS.map(m => (
                <button key={m.id} onClick={() => setModel(m.id)} disabled={modelSaving}
                  className={`w-full text-left rounded-2xl p-5 transition-all border-2 ${config.activeModel === m.id ? "border-gray-900" : "border-transparent hover:border-gray-300"}`}
                  style={{ backgroundColor: config.activeModel === m.id ? "#fdf9f2" : "#f0ebe2" }}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${config.activeModel === m.id ? "border-gray-900" : "border-gray-400"}`}>
                        {config.activeModel === m.id && <div className="h-2.5 w-2.5 rounded-full bg-gray-900" />}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-gray-900">{m.label}</p>
                        <p className="text-[12px] text-gray-500 mt-0.5">{m.desc}</p>
                      </div>
                    </div>
                    <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.badge === "Fast" ? "bg-green-100 text-green-700" :
                      m.badge === "Pro" ? "bg-primary/10 text-primary" :
                      m.badge === "Reasoning" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
                    }`}>{m.badge}</span>
                  </div>
                  {config.activeModel === m.id && (
                    <div className="mt-3 ml-8 text-[11px] font-semibold text-green-700 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Currently active — serving all requests
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[12px] text-gray-400 mt-4">
              Note: The active model is stored in the platform config and applied to all AI requests unless a user has their own API key (Enterprise/Max plan).
            </p>
          </div>
        )}

        {/* ── Config ── */}
        {activeTab === "config" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Platform Configuration</h2>
            <div className="rounded-2xl p-6 space-y-4" style={card}>
              <div>
                <p className="text-[13px] font-semibold text-gray-700 mb-1">Worker Environment</p>
                <p className="text-[13px] text-gray-500">Active at <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[12px]">medmed-agent.hellonolen.workers.dev</code></p>
              </div>
              <div className="h-px" style={{ backgroundColor: "#e0d8cc" }} />
              <div>
                <p className="text-[13px] font-semibold text-gray-700 mb-1">Active LLM</p>
                <p className="text-[13px] text-gray-500 font-mono">{config.activeModel}</p>
              </div>
              <div className="h-px" style={{ backgroundColor: "#e0d8cc" }} />
              <div>
                <p className="text-[13px] font-semibold text-gray-700 mb-1">BYOA (Bring Your Own API)</p>
                <p className="text-[13px] text-gray-500">Enabled for Enterprise and Max plan users. Users can add their own Gemini API key in Settings → API Key to bypass platform quota.</p>
              </div>
              <div className="h-px" style={{ backgroundColor: "#e0d8cc" }} />
              <div>
                <p className="text-[13px] font-semibold text-gray-700 mb-1">Plans with BYOA access</p>
                <div className="flex gap-2 mt-1">
                  {["enterprise", "max"].map(p => (
                    <span key={p} className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 capitalize">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
