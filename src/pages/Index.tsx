import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { aiService } from "@/services/AIService";
import { useMedicalSearch } from "@/contexts/MedicalSearchContext";
import { useQuotaGuard } from "@/hooks/useQuotaGuard";
import { toast } from "sonner";
import { MediaCaptureModal } from "@/components/MediaCaptureModal";

/* ─── Types ─────────────────────────────────────────── */
interface Message {
  id: string;
  content: string;
  type: "ai" | "user" | "error";
}

type Mode = "general" | "symptom" | "pharmacy" | "interaction";

const MODE_CONFIG: Record<Mode, { label: string; placeholder: string; systemPrompt: string }> = {
  general: {
    label: "",
    placeholder: "Ask anything about medications, symptoms, or healthcare...",
    systemPrompt: "You are MedMed.AI, a helpful healthcare information assistant. Provide clear, accurate information about medications, symptoms, and healthcare. Always include a brief disclaimer that your responses are for informational purposes only and do not replace professional medical advice.",
  },
  symptom: {
    label: "Symptom Checker",
    placeholder: "Describe your symptoms in detail...",
    systemPrompt: "You are MedMed.AI's Symptom Checker. The user is describing symptoms. Provide a structured, helpful analysis: possible conditions, a likelihood summary, specialist referral suggestions, and when to seek emergency care. Use clear headings. Always end with a disclaimer that this is not a diagnosis.",
  },
  pharmacy: {
    label: "Pharmacy Finder",
    placeholder: "Enter a medication name, location, or pharmacy question...",
    systemPrompt: "You are MedMed.AI's Pharmacy assistant. Help users find information about pharmacies, medication availability, pricing, and pharmacy services. If a location is mentioned, provide relevant information about pharmacy options. Always note that availability and pricing should be verified directly.",
  },
  interaction: {
    label: "Interaction Checker",
    placeholder: "List the medications you want to check (e.g. aspirin + ibuprofen)...",
    systemPrompt: "You are MedMed.AI's Drug Interaction Checker. Analyze the medications the user lists and clearly describe: known interactions (major, moderate, minor), what each interaction involves, and recommended precautions. Use clear severity labels. Always advise consulting a pharmacist or physician before making changes.",
  },
};

/* ─── Markdown renderer ─────────────────────────────── */
function renderMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, "<em>$1</em>")
    .replace(/^#{3}\s+(.+)$/gm, '<h3 class="font-semibold text-[15px] mt-4 mb-1">$1</h3>')
    .replace(/^#{2}\s+(.+)$/gm, '<h2 class="font-bold text-[16px] mt-4 mb-1">$1</h2>')
    .replace(/^[-*]\s+(.+)$/gm, '<li class="ml-5 list-disc leading-relaxed">$1</li>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-5 list-decimal leading-relaxed">$1</li>')
    .replace(/(<li[^>]*>.*?<\/li>\n?)+/gs, (m) => `<ul class="my-2 space-y-1">${m}</ul>`)
    .replace(/\n{2,}/g, '</p><p class="mt-3">')
    .replace(/\n/g, "<br />");
}

/* ─── Panel / Sidebar SVG icon ──────────────────────── */
function PanelIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="1.5" y="1.5" width="15" height="15" rx="2.5" />
      <line x1="6" y1="1.5" x2="6" y2="16.5" />
    </svg>
  );
}

/* ─── Plus / Tool Picker ────────────────────────────── */
function ToolPicker({ onSelect }: { onSelect: (mode: Mode) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const tools: { mode: Mode; label: string; desc: string }[] = [
    { mode: "symptom", label: "Symptom Checker", desc: "Describe symptoms for possible conditions" },
    { mode: "pharmacy", label: "Pharmacy Finder", desc: "Find medications and pharmacy info" },
    { mode: "interaction", label: "Interaction Checker", desc: "Check drug interactions" },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-[#e4ddd0] transition-colors text-[18px] font-light leading-none"
        title="Tools"
      >
        +
      </button>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 w-64 rounded-2xl shadow-lg overflow-hidden z-50 py-1"
          style={{ backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" }}
        >
          {tools.map(({ mode, label, desc }) => (
            <button
              key={mode}
              onClick={() => { onSelect(mode); setOpen(false); }}
              className="w-full text-left px-4 py-3 hover:bg-[#e4ddd0] transition-colors"
            >
              <p className="text-[13.5px] font-medium text-gray-900">{label}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Upgrade Modal ─────────────────────────────────── */
function UpgradeModal({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="max-w-sm w-full mx-4 rounded-2xl p-8 shadow-xl"
        style={{ backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-gray-900 mb-2">Continue with Pro</h2>
        <p className="text-[15px] text-gray-600 mb-6 leading-relaxed">
          You've reached the free limit. Upgrade for unlimited access, conversation history, and document storage.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => { navigate("/pricing"); onClose(); }}
            className="w-full py-3 rounded-xl bg-primary text-white font-medium text-[15px] hover:bg-primary/90 transition-colors"
          >
            See Plans
          </button>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl text-gray-500 text-[14px] hover:text-gray-900 transition-colors">
            Maybe later
          </button>
        </div>
        <p className="text-[12px] text-gray-400 text-center mt-4">Cancel anytime.</p>
      </div>
    </div>
  );
}

/* ─── User Avatar Popover ───────────────────────────── */
function UserAvatarMenu({ user, onSignOut }: { user: { name: string | null; email: string; tier: string }; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();
  const displayName = user.name || user.email.split("@")[0];

  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      {open && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 rounded-2xl shadow-lg overflow-hidden z-50"
          style={{ backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: "#e0d8cc" }}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 truncate">{displayName}</p>
                <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <div className="mt-2">
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full capitalize">
                {user.tier} plan
              </span>
            </div>
          </div>
          <div className="py-1">
            {[
              { label: "Account settings", path: "/settings" },
              { label: "Billing & plans", path: "/pricing" },
              { label: "Policy Center", path: "/policy" },
            ].map(({ label, path }) => (
              <button key={path} onClick={() => { navigate(path); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-[#e4ddd0] transition-colors">
                {label}
              </button>
            ))}
          </div>
          <div className="border-t py-1" style={{ borderColor: "#e0d8cc" }}>
            <button onClick={() => { onSignOut(); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 text-[13px] text-gray-500 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors">
              Sign out
            </button>
          </div>
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#e4ddd0] transition-colors text-left">
        <div className="h-8 w-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-[13px] font-semibold flex-shrink-0">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-gray-900 truncate leading-tight">{displayName}</p>
          <p className="text-[11px] text-gray-500 truncate leading-tight capitalize">{user.tier} plan</p>
        </div>
      </button>
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────── */
const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [mode, setMode] = useState<Mode>("general");
  const [mediaModal, setMediaModal] = useState<"image" | "video" | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try { return localStorage.getItem("mm_sidebar") !== "closed"; } catch (_) { return true; }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const { searchWithContext } = useMedicalSearch();
  const { user, signOut } = useAuth();
  const { tier } = useSubscription();
  const quota = useQuotaGuard(user?.id);

  const hasMessages = messages.length > 0;
  const isPro = user?.tier === "premium" || user?.tier === "business";
  const cfg = MODE_CONFIG[mode];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const toggleSidebar = () => {
    setSidebarOpen((o) => {
      const next = !o;
      try { localStorage.setItem("mm_sidebar", next ? "open" : "closed"); } catch (_) { /* noop */ }
      return next;
    });
  };

  const activateMode = (m: Mode) => {
    setMode(m);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const send = useCallback(async (query: string) => {
    if (!query.trim() || thinking) return;
    if (!quota.checkAndGate()) return;

    const q = query.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), content: q, type: "user" }]);
    setThinking(true);
    quota.recordQuestion();

    try {
      searchWithContext(q, mode === "pharmacy" ? "location" : undefined).catch(() => {/* silent */});

      const response = await aiService.askAI({
        query: q,
        systemPrompt: cfg.systemPrompt,
      });

      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        content: response.success && response.content ? response.content : "I ran into an issue. Please try again.",
        type: response.success ? "ai" : "error",
      }]);
    } catch {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), content: "Something went wrong. Please try again.", type: "error" }]);
      toast.error("Connection error.");
    } finally {
      setThinking(false);
    }
  }, [thinking, quota, searchWithContext, cfg]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter = new line. Only the button submits.
    // (no special key handling needed — textarea default Enter = newline)
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const newChat = () => {
    setMessages([]);
    setInput("");
    setMode("general");
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  /* ── Shared input box ── */
  const InputBox = (
    <div
      className="w-full max-w-2xl relative rounded-2xl border shadow-sm transition-all focus-within:shadow-md"
      style={{ backgroundColor: "#fdf9f2", borderColor: "#e0d8cc" }}
    >
      {/* Mode badge */}
      {mode !== "general" && (
        <div className="flex items-center gap-2 px-5 pt-3 pb-1">
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full"
          >
            {cfg.label}
            <button
              onClick={() => setMode("general")}
              className="text-primary/60 hover:text-primary leading-none ml-0.5"
              title="Clear mode"
            >
              &times;
            </button>
          </span>
        </div>
      )}

      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKey}
        placeholder={cfg.placeholder}
        rows={1}
        disabled={thinking}
        className="w-full resize-none bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none px-5 pt-4 pb-14 max-h-[200px] leading-relaxed"
        autoFocus
      />

      {/* Bottom row: + tools | camera | video  →→→  send */}
      <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1 pointer-events-auto">
          <ToolPicker onSelect={activateMode} />
          {/* Camera button */}
          <button
            type="button"
            onClick={() => isPro ? setMediaModal("image") : quota.showUpgradeModal || navigate("/pricing")}
            title={isPro ? "Take a photo" : "Pro feature"}
            className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
              isPro ? "text-gray-400 hover:text-gray-700 hover:bg-[#e4ddd0]" : "text-gray-300 cursor-not-allowed"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          {/* Video button */}
          <button
            type="button"
            onClick={() => isPro ? setMediaModal("video") : navigate("/pricing")}
            title={isPro ? "Record a video" : "Pro feature"}
            className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
              isPro ? "text-gray-400 hover:text-gray-700 hover:bg-[#e4ddd0]" : "text-gray-300 cursor-not-allowed"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>
        </div>
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || thinking}
          className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-25 hover:bg-primary/90 transition-all pointer-events-auto text-base flex-shrink-0"
        >
          {thinking ? (
            <span className="flex gap-0.5 items-center">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-bounce" style={{ animationDelay: "300ms" }} />
            </span>
          ) : "↑"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <div
        className="relative flex-shrink-0 h-full transition-all duration-300"
        style={{ width: sidebarOpen ? "260px" : "0px", minWidth: sidebarOpen ? "260px" : "0px" }}
      >
        <aside
          className="absolute inset-0 flex flex-col h-full border-r overflow-hidden"
          style={{ backgroundColor: "#f0ebe2", borderColor: "#e0d8cc" }}
        >
          {/* Top */}
          <div className="flex items-center gap-3 px-4 pt-5 pb-4 flex-shrink-0">
            <button
              onClick={toggleSidebar}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-[#e4ddd0] hover:text-gray-800 transition-colors"
              title="Close sidebar"
            >
              <PanelIcon />
            </button>
            <Link to="/" className="text-[15px] font-semibold text-gray-900 tracking-tight">MedMed.AI</Link>
          </div>

          {/* New chat */}
          <div className="px-3 mb-4 flex-shrink-0">
            <button
              onClick={newChat}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13.5px] text-gray-700 hover:bg-[#e4ddd0] transition-colors"
            >
              <span className="text-[18px] font-light leading-none">+</span>
              New conversation
            </button>
          </div>

          {/* Tools — inline mode buttons */}
          <div className="px-3 mb-1 flex-shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-1">Tools</p>
          </div>
          <nav className="px-3 space-y-0.5 flex-shrink-0">
            {([
              { mode: "symptom" as Mode, label: "Symptom Checker" },
              { mode: "pharmacy" as Mode, label: "Pharmacy Finder" },
              { mode: "interaction" as Mode, label: "Interaction Checker" },
            ]).map(({ mode: m, label }) => (
              <button
                key={m}
                onClick={() => activateMode(m)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] transition-colors ${
                  mode === m ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Business */}
          <div className="px-3 mt-4 mb-1 flex-shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-1">Business</p>
          </div>
          <nav className="px-3 space-y-0.5 flex-shrink-0">
            {[
              { to: "/sponsor-portal", label: "Sponsor Portal" },
              { to: "/advertiser-enrollment", label: "Advertiser Access" },
            ].map(({ to, label }) => (
              <Link key={to} to={to}
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          {/* Pro conversation history */}
          {isPro && (
            <div className="flex-1 min-h-0 mt-4 px-3 overflow-y-auto">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-2">Recents</p>
              <p className="text-[12px] text-gray-400 px-2">Your conversations will appear here.</p>
            </div>
          )}

          <div className="flex-1" />

          {/* Bottom user section */}
          <div className="mt-auto px-3 py-4 border-t flex-shrink-0 space-y-1" style={{ borderColor: "#d8d0c0" }}>
            {user && !isPro && (
              <button
                onClick={() => navigate("/pricing")}
                className="w-full text-left px-4 py-2.5 rounded-xl text-[13px] text-primary font-medium hover:bg-primary/10 transition-colors mb-2"
              >
                Upgrade to Pro →
              </button>
            )}
            {user ? (
              <UserAvatarMenu user={{ name: user.name, email: user.email, tier: user.tier }} onSignOut={signOut} />
            ) : (
              <>
                <Link to="/signin" className="block px-4 py-2.5 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors">
                  Sign in
                </Link>
                <Link to="/signup" className="block px-4 py-2.5 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors">
                  Create account
                </Link>
              </>
            )}
          </div>
        </aside>
      </div>

      {/* ── Main ── */}
      <main className="flex flex-col flex-1 h-full min-w-0 overflow-hidden relative">

        {/* Floating toggle when sidebar closed */}
        {!sidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="absolute top-4 left-4 z-10 h-8 w-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-[#e4ddd0] hover:text-gray-800 transition-colors"
            style={{ backgroundColor: "#faf8f4" }}
            title="Open sidebar"
          >
            <PanelIcon />
          </button>
        )}

        {!hasMessages ? (
          <div className="flex flex-col items-center justify-center flex-1 px-6">
            <h1 className="text-[2rem] font-semibold text-gray-900 mb-8 tracking-tight">How can I help you?</h1>
            {InputBox}
            <p className="text-[11px] text-gray-400 mt-3 text-center">
              <Link to="/policy" className="hover:text-gray-600 transition-colors">Policy Center</Link>
              {" · "}
              <button onClick={newChat} className="hover:text-gray-600 transition-colors">Support</button>
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-2xl mx-auto w-full px-6 py-10 space-y-8">
                {messages.map((msg) => (
                  <div key={msg.id}>
                    {msg.type === "user" ? (
                      <div className="flex justify-end">
                        <div
                          className="max-w-[80%] px-4 py-3 rounded-2xl rounded-br-sm text-[15px] leading-relaxed text-gray-900"
                          style={{ backgroundColor: "#ede8de" }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ) : msg.type === "error" ? (
                      <p className="text-[15px] text-red-500 leading-relaxed">{msg.content}</p>
                    ) : (
                      <div
                        className="text-[15px] leading-[1.8] text-gray-800"
                        dangerouslySetInnerHTML={{ __html: `<p>${renderMd(msg.content)}</p>` }}
                      />
                    )}
                  </div>
                ))}
                {thinking && (
                  <div className="flex gap-1.5 items-center pt-1">
                    {[0, 160, 320].map((d) => (
                      <span key={d} className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="flex-shrink-0 flex justify-center px-6 pb-4 pt-2">
              {InputBox}
            </div>
            <p className="text-center text-[11px] text-gray-400 pb-3">
              <Link to="/policy" className="hover:text-gray-600">Policy Center</Link>
              {" · "}
              <button onClick={newChat} className="hover:text-gray-600">Support</button>
            </p>
          </>
        )}
      </main>

      {quota.showUpgradeModal && <UpgradeModal onClose={quota.dismissUpgradeModal} />}

      {mediaModal && (
        <MediaCaptureModal
          type={mediaModal}
          onClose={() => setMediaModal(null)}
          onAnalysis={(text) => {
            setMessages((prev) => [...prev, { id: crypto.randomUUID(), content: text, type: "ai" }]);
            setMediaModal(null);
          }}
        />
      )}
    </div>
  );
};

export default Index;
