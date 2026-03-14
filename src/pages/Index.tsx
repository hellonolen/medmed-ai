import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { aiService } from "@/services/AIService";
import { useMedicalSearch } from "@/contexts/MedicalSearchContext";
import { useQuotaGuard } from "@/hooks/useQuotaGuard";
import { useVoice } from "@/hooks/useVoice";
import { bus, AGENT_EVENTS } from "@/lib/eventBus";
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

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CustomizeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function ChatsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ArtifactsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
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

  // ── Sidebar section collapse state ──
  const [sections, setSections] = useState({
    chats: true,
    projects: true,
    library: true,
    business: false,
  });
  const toggleSection = (k: keyof typeof sections) =>
    setSections(prev => ({ ...prev, [k]: !prev[k] }));

  // ── User Projects (folder list) ──
  const [projects, setProjects] = useState<Array<{id: string; name: string}>>(() => {
    try { return JSON.parse(localStorage.getItem('mm_projects') || '[]'); } catch { return []; }
  });
  const [newProjectName, setNewProjectName] = useState('');
  const [addingProject, setAddingProject] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const saveProjects = (list: typeof projects) => {
    setProjects(list);
    try { localStorage.setItem('mm_projects', JSON.stringify(list)); } catch { /* noop */ }
  };
  const addProject = () => {
    if (!newProjectName.trim()) return;
    saveProjects([...projects, { id: crypto.randomUUID(), name: newProjectName.trim() }]);
    setNewProjectName('');
    setAddingProject(false);
  };
  const startRename = (id: string, name: string) => { setRenamingId(id); setRenameValue(name); };
  const commitRename = () => {
    if (!renamingId) return;
    saveProjects(projects.map(p => p.id === renamingId ? { ...p, name: renameValue.trim() || p.name } : p));
    setRenamingId(null);
  };
  const deleteProject = (id: string) => saveProjects(projects.filter(p => p.id !== id));

  // ── User Library folders ──
  const [libraryFolders, setLibraryFolders] = useState<Array<{id: string; name: string}>>(() => {
    try { return JSON.parse(localStorage.getItem('mm_library_folders') || '[]'); } catch { return []; }
  });
  const [newLibName, setNewLibName] = useState('');
  const [addingLib, setAddingLib] = useState(false);
  const [renamingLibId, setRenamingLibId] = useState<string | null>(null);
  const [renameLibValue, setRenameLibValue] = useState('');

  const saveLibFolders = (list: typeof libraryFolders) => {
    setLibraryFolders(list);
    try { localStorage.setItem('mm_library_folders', JSON.stringify(list)); } catch { /* noop */ }
  };
  const addLibFolder = () => {
    if (!newLibName.trim()) return;
    saveLibFolders([...libraryFolders, { id: crypto.randomUUID(), name: newLibName.trim() }]);
    setNewLibName('');
    setAddingLib(false);
  };
  const startRenameLib = (id: string, name: string) => { setRenamingLibId(id); setRenameLibValue(name); };
  const commitRenameLib = () => {
    if (!renamingLibId) return;
    saveLibFolders(libraryFolders.map(f => f.id === renamingLibId ? { ...f, name: renameLibValue.trim() || f.name } : f));
    setRenamingLibId(null);
  };
  const deleteLibFolder = (id: string) => saveLibFolders(libraryFolders.filter(f => f.id !== id));
  const [voiceInterim, setVoiceInterim] = useState("");
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const { isListening, isSpeaking, supported: voiceSupported, ttsSupported, startListening, stopListening, speak, stopSpeaking } = useVoice({
    autoSpeak: false, // we control TTS manually
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        setInput(text);
        setVoiceInterim("");
        setTimeout(() => send(text), 100);
      } else {
        setVoiceInterim(text);
      }
    },
    onError: (e) => toast.error(`Mic: ${e}`),
  });

  // Subscribe to agent response events for TTS
  useEffect(() => {
    return bus.on<string>(AGENT_EVENTS.AGENT_RESPONSE, (text) => {
      if (ttsEnabled && ttsSupported) speak(text);
    });
  }, [ttsEnabled, ttsSupported, speak]);

  // Proactive messages from agent
  const [proactiveBanner, setProactiveBanner] = useState<string | null>(null);
  useEffect(() => {
    return bus.on<{ id: string; text: string }>(AGENT_EVENTS.AGENT_PROACTIVE, ({ text }) => {
      setProactiveBanner(text);
      setTimeout(() => setProactiveBanner(null), 12000);
    });
  }, []);

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

      const content = response.success && response.content ? response.content : "I ran into an issue. Please try again.";
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        content,
        type: response.success ? "ai" : "error",
      }]);
      // Fire on bus so TTS can pick it up
      bus.emit(AGENT_EVENTS.AGENT_RESPONSE, content);
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

          {/* Bottom row: + tools | camera | video | mic  →→→  TTS toggle | send */}
      <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1 pointer-events-auto">
          <ToolPicker onSelect={activateMode} />
          {/* Camera */}
          <button
            type="button"
            onClick={() => isPro ? setMediaModal("image") : navigate("/pricing")}
            title={isPro ? "Take a photo for Gemini to analyze" : "Pro feature"}
            className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${isPro ? "text-gray-400 hover:text-gray-700 hover:bg-[#e4ddd0]" : "text-gray-300 cursor-not-allowed"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          {/* Video */}
          <button
            type="button"
            onClick={() => isPro ? setMediaModal("video") : navigate("/pricing")}
            title={isPro ? "Record a video" : "Pro feature"}
            className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${isPro ? "text-gray-400 hover:text-gray-700 hover:bg-[#e4ddd0]" : "text-gray-300 cursor-not-allowed"}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </button>
          {/* Microphone — voice input */}
          {voiceSupported && (
            <button
              type="button"
              onClick={() => isListening ? stopListening() : startListening()}
              title={isListening ? "Stop listening" : "Speak to MedMed.AI"}
              className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                isListening ? "bg-red-100 text-red-500 animate-pulse" : "text-gray-400 hover:text-gray-700 hover:bg-[#e4ddd0]"
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          )}
          {/* TTS toggle */}
          {ttsSupported && (
            <button
              type="button"
              onClick={() => { setTtsEnabled(e => !e); if (isSpeaking) stopSpeaking(); }}
              title={ttsEnabled ? "Mute Gemini voice" : "Enable Gemini voice"}
              className={`h-7 w-7 rounded-lg flex items-center justify-center transition-colors ${
                ttsEnabled ? "bg-primary/10 text-primary" : "text-gray-400 hover:text-gray-700 hover:bg-[#e4ddd0]"
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                {ttsEnabled ? (
                  <><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></>
                ) : (
                  <><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></>
                )}
              </svg>
            </button>
          )}
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

      {/* ── Proactive agent banner ── */}
      {proactiveBanner && (
        <div
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4 px-4 py-3 rounded-2xl shadow-lg text-[13px] text-gray-800 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ backgroundColor: "#fdf9f2", border: "1px solid #d8d0c0" }}
        >
          <span className="text-base flex-shrink-0">🤖</span>
          <span className="flex-1 leading-relaxed">{proactiveBanner}</span>
          <button onClick={() => setProactiveBanner(null)} className="text-gray-400 hover:text-gray-700 flex-shrink-0 text-lg leading-none">&times;</button>
        </div>
      )}

      {/* Voice listening indicator */}
      {isListening && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-200 text-[12px] text-red-600 font-medium shadow-sm">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Listening{voiceInterim ? `: "${voiceInterim}"` : "…"}
        </div>
      )}

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

          {/* Nav sections matching attachment */}
          <nav className="px-3 space-y-0.5 flex-shrink-0 mt-1">
            {[
              { label: "Search", icon: SearchIcon, action: () => {} },
              { label: "Customize", icon: CustomizeIcon, action: () => navigate("/settings") },
            ].map(({ label, icon: Icon, action }) => (
              <button key={label} onClick={action}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors">
                <Icon />
                {label}
              </button>
            ))}
          </nav>

          {/* ── Chats ── */}
          <div className="px-3 mt-4 mb-0 flex-shrink-0">
            <button
              onClick={() => toggleSection('chats')}
              className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-[#e4ddd0] transition-colors"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Chats</p>
              <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${sections.chats ? 'rotate-0' : '-rotate-90'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75"><polyline points="2,4 6,8 10,4" /></svg>
            </button>
          </div>
          {sections.chats && (
            <nav className="px-3 space-y-0.5 flex-shrink-0 mt-0.5">
              <Link to="/history" className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors">
                <ChatsIcon />
                All conversations
              </Link>
            </nav>
          )}

          {/* ── Projects (folders) ── */}
          <div className="px-3 mt-3 mb-0 flex-shrink-0">
            <button
              onClick={() => toggleSection('projects')}
              className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-[#e4ddd0] transition-colors"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Projects</p>
              <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${sections.projects ? 'rotate-0' : '-rotate-90'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75"><polyline points="2,4 6,8 10,4" /></svg>
            </button>
          </div>
          {sections.projects && (
            <nav className="px-3 space-y-0.5 flex-shrink-0 mt-0.5">
              {/* Built-in project links */}
              {[
                { to: '/medications', label: 'Medication Tracker' },
                { to: '/journal', label: 'Symptom Journal' },
                { to: '/health-profile', label: 'Health Profile' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors">
                  <ProjectsIcon />
                  {label}
                </Link>
              ))}

              {/* User-created project folders */}
              {projects.map(p => (
                <div key={p.id} className="flex items-center gap-1 group px-3 py-2 rounded-xl hover:bg-[#e4ddd0] transition-colors">
                  <ProjectsIcon />
                  {renamingId === p.id ? (
                    <input
                      autoFocus
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingId(null); }}
                      onBlur={commitRename}
                      className="flex-1 bg-transparent text-[13px] text-gray-900 outline-none border-b border-primary"
                    />
                  ) : (
                    <span
                      className="flex-1 text-[13.5px] text-gray-700 truncate cursor-default"
                      onDoubleClick={() => startRename(p.id, p.name)}
                    >{p.name}</span>
                  )}
                  <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => startRename(p.id, p.name)} title="Rename" className="p-0.5 text-gray-400 hover:text-gray-700 transition-colors">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button onClick={() => deleteProject(p.id)} title="Delete" className="p-0.5 text-gray-400 hover:text-red-500 transition-colors">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* New project input */}
              {addingProject ? (
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <ProjectsIcon />
                  <input
                    autoFocus
                    value={newProjectName}
                    onChange={e => setNewProjectName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addProject(); if (e.key === 'Escape') { setAddingProject(false); setNewProjectName(''); } }}
                    onBlur={() => { if (!newProjectName.trim()) setAddingProject(false); }}
                    placeholder="Project name…"
                    className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder:text-gray-400 outline-none border-b border-primary"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setAddingProject(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-gray-400 hover:text-gray-700 hover:bg-[#e4ddd0] transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  New project
                </button>
              )}
            </nav>
          )}

          {/* ── Library (was Artifacts) ── */}
          <div className="px-3 mt-3 mb-0 flex-shrink-0">
            <button
              onClick={() => toggleSection('library')}
              className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-[#e4ddd0] transition-colors"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Library</p>
              <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${sections.library ? 'rotate-0' : '-rotate-90'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75"><polyline points="2,4 6,8 10,4" /></svg>
            </button>
          </div>
          {sections.library && (
            <nav className="px-3 space-y-0.5 flex-shrink-0 mt-0.5">
              <Link to="/favorites" className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors">
                <ArtifactsIcon />
                Saved responses
              </Link>

              {/* User library folders */}
              {libraryFolders.map(f => (
                <div key={f.id} className="flex items-center gap-1 group px-3 py-2 rounded-xl hover:bg-[#e4ddd0] transition-colors">
                  <ArtifactsIcon />
                  {renamingLibId === f.id ? (
                    <input
                      autoFocus value={renameLibValue}
                      onChange={e => setRenameLibValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') commitRenameLib(); if (e.key === 'Escape') setRenamingLibId(null); }}
                      onBlur={commitRenameLib}
                      className="flex-1 bg-transparent text-[13px] text-gray-900 outline-none border-b border-primary"
                    />
                  ) : (
                    <span className="flex-1 text-[13.5px] text-gray-700 truncate cursor-default" onDoubleClick={() => startRenameLib(f.id, f.name)}>{f.name}</span>
                  )}
                  <div className="hidden group-hover:flex items-center gap-0.5 flex-shrink-0">
                    <button onClick={() => startRenameLib(f.id, f.name)} title="Rename" className="p-0.5 text-gray-400 hover:text-gray-700 transition-colors">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button onClick={() => deleteLibFolder(f.id)} title="Delete" className="p-0.5 text-gray-400 hover:text-red-500 transition-colors">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3,6 5,6 21,6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
                    </button>
                  </div>
                </div>
              ))}

              {addingLib ? (
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <ArtifactsIcon />
                  <input
                    autoFocus value={newLibName}
                    onChange={e => setNewLibName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') addLibFolder(); if (e.key === 'Escape') { setAddingLib(false); setNewLibName(''); } }}
                    onBlur={() => { if (!newLibName.trim()) setAddingLib(false); }}
                    placeholder="Folder name…"
                    className="flex-1 bg-transparent text-[13px] text-gray-900 placeholder:text-gray-400 outline-none border-b border-primary"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setAddingLib(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] text-gray-400 hover:text-gray-700 hover:bg-[#e4ddd0] transition-colors"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                  New folder
                </button>
              )}
            </nav>
          )}

          {/* ── Business ── */}
          <div className="px-3 mt-3 mb-0 flex-shrink-0">
            <button
              onClick={() => toggleSection('business')}
              className="w-full flex items-center justify-between px-2 py-1 rounded hover:bg-[#e4ddd0] transition-colors"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Business</p>
              <svg className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${sections.business ? 'rotate-0' : '-rotate-90'}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75"><polyline points="2,4 6,8 10,4" /></svg>
            </button>
          </div>
          {sections.business && (
            <nav className="px-3 space-y-0.5 flex-shrink-0 mt-0.5">
              {[
                { to: '/business', label: 'Business Center' },
                { to: '/sponsor-portal', label: 'Sponsor' },
                { to: '/advertiser-enrollment', label: 'Advertiser' },
                { to: '/referral', label: 'Affiliates' },
                { to: '/policy', label: 'Policy Center' },
              ].map(({ to, label }) => (
                <Link key={to} to={to} className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors">
                  {label}
                </Link>
              ))}
            </nav>
          )}

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
          <div className="flex flex-col items-center justify-center flex-1 px-6 pb-10">
            <h1 className="text-[2rem] font-semibold text-gray-900 mb-8 tracking-tight">How can I help you?</h1>
            {InputBox}
            {/* Disclaimer — standalone, below input */}
            <p className="text-[11.5px] text-gray-400 mt-3 text-center max-w-2xl w-full">
              medmed.ai can make mistakes. Confirm your communications.
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
                    <span className="text-[12px] text-gray-400 mr-1">Thinking</span>
                    {[0, 160, 320].map((d) => (
                      <span key={d} className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            <div className="flex-shrink-0 flex flex-col items-center px-6 pb-2 pt-2">
              {InputBox}
              {/* Disclaimer — standalone, below input */}
              <p className="text-[11.5px] text-gray-400 mt-2 text-center max-w-2xl w-full">
                medmed.ai can make mistakes. Confirm your communications.
              </p>
            </div>
          </>
        )}

        {/* ── Standalone footer — absolute bottom-right of main ── */}
        <div className="absolute bottom-3 right-5 text-right pointer-events-none">
          <p className="text-[11px] text-gray-400 pointer-events-auto">
            <Link to="/business" className="hover:text-gray-600 transition-colors">Business Center</Link>
            {" · "}
            <Link to="/policy" className="hover:text-gray-600 transition-colors">Policy Center</Link>
            {" · "}
            <Link to="/contact" className="hover:text-gray-600 transition-colors">Support</Link>
          </p>
        </div>
      </main>

      {quota.showUpgradeModal && <UpgradeModal onClose={quota.dismissUpgradeModal} />}

      {mediaModal && (
        <MediaCaptureModal
          type={mediaModal}
          onClose={() => setMediaModal(null)}
          onAnalysis={(text) => {
            const mediaType = mediaModal;
            // Add a context message so the user sees something was shared
            setMessages(prev => [
              ...prev,
              {
                id: crypto.randomUUID(),
                content: mediaType === 'image'
                  ? '📷 *Photo shared — Gemini is responding…*'
                  : '🎥 *Video frame shared — Gemini is responding…*',
                type: 'user' as const,
              },
              { id: crypto.randomUUID(), content: text, type: 'ai' as const },
            ]);
            setMediaModal(null);
            // Gemini speaks its analysis response via TTS
            if (ttsEnabled && ttsSupported) {
              speak(text);
            } else if (ttsSupported) {
              // Auto-speak vision responses even if TTS is in manual mode — the user needs to hear this
              speak(text);
            }
          }}
        />
      )}
    </div>
  );
};

export default Index;
