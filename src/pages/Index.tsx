import { useState, useRef, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { aiService } from "@/services/AIService";
import { useMedicalSearch } from "@/contexts/MedicalSearchContext";
import { useQuotaGuard } from "@/hooks/useQuotaGuard";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────── */
interface Message {
  id: string;
  content: string;
  type: "ai" | "user" | "error";
}

/* ─── Markdown renderer ─────────────────────────────── */
function renderMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, "<em>$1</em>")
    .replace(/^#{3}\s+(.+)$/gm, '<h3 class="font-semibold text-base mt-4 mb-1">$1</h3>')
    .replace(/^#{2}\s+(.+)$/gm, '<h2 class="font-bold text-lg mt-4 mb-1">$1</h2>')
    .replace(/^[-*]\s+(.+)$/gm, '<li class="ml-5 list-disc leading-relaxed">$1</li>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li class="ml-5 list-decimal leading-relaxed">$1</li>')
    .replace(/(<li[^>]*>.*?<\/li>\n?)+/gs, (m) => `<ul class="my-2 space-y-1">${m}</ul>`)
    .replace(/\n{2,}/g, '</p><p class="mt-3">')
    .replace(/\n/g, "<br />");
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
          You've reached the free limit. Upgrade to Pro for unlimited access, conversation history, and document storage.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => navigate("/subscription")}
            className="w-full py-3 rounded-xl bg-primary text-white font-medium text-[15px] hover:bg-primary/90 transition-colors"
          >
            Upgrade to Pro — $19/mo
          </button>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-gray-500 text-[14px] hover:text-gray-900 transition-colors"
          >
            Maybe later
          </button>
        </div>
        <p className="text-[12px] text-gray-400 text-center mt-4">7-day refund if it's not for you.</p>
      </div>
    </div>
  );
}

/* ─── User Avatar Menu ───────────────────────────────── */
function UserAvatarMenu({ user, onSignOut }: { user: { name: string | null; email: string; tier: string }; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase();
  const firstName = user.name?.split(" ")[0] ?? user.email.split("@")[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#e4ddd0] transition-colors text-left"
      >
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary text-sm font-semibold">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-gray-900 truncate">{firstName}</p>
          <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
        </div>
      </button>

      {open && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 rounded-xl shadow-lg py-1 z-50"
          style={{ backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" }}
        >
          <div className="px-4 py-2.5 border-b mb-1" style={{ borderColor: "#e0d8cc" }}>
            <p className="text-[13px] font-semibold text-gray-900">{user.name || firstName}</p>
            <p className="text-[11px] text-gray-500">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {user.tier}
            </span>
          </div>
          {[
            { label: "Account settings", path: "/settings" },
            { label: "Billing", path: "/subscription" },
            { label: "Storage", path: "/account#storage" },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() => { navigate(path); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-[13px] text-gray-700 hover:bg-[#e4ddd0] transition-colors"
            >
              {label}
            </button>
          ))}
          <div className="border-t mt-1" style={{ borderColor: "#e0d8cc" }}>
            <button
              onClick={() => { onSignOut(); setOpen(false); }}
              className="w-full text-left px-4 py-2 text-[13px] text-gray-500 hover:bg-[#e4ddd0] transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main App ──────────────────────────────────────── */
const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try { return localStorage.getItem("mm_sidebar") !== "closed"; } catch { return true; }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { t } = useLanguage();
  const { searchWithContext } = useMedicalSearch();
  const { user, signOut } = useAuth();
  const { tier } = useSubscription();
  const quota = useQuotaGuard(user?.id);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const toggleSidebar = () => {
    setSidebarOpen((o) => {
      const next = !o;
      try { localStorage.setItem("mm_sidebar", next ? "open" : "closed"); } catch (_) { /* storage unavailable */ }
      return next;
    });
  };

  const send = useCallback(async (query: string) => {
    if (!query.trim() || thinking) return;

    // Quota gate
    if (!quota.checkAndGate()) return;

    const q = query.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), content: q, type: "user" }]);
    setThinking(true);
    quota.recordQuestion();

    try {
      const isLocationSearch =
        /\b(in|near|at|around)\b/.test(q.toLowerCase()) ||
        /\b(new york|los angeles|chicago|houston|miami|boston|atlanta|seattle|denver|dallas|phoenix|philadelphia)\b/i.test(q);

      searchWithContext(q, isLocationSearch ? "location" : undefined).catch(() => {});

      const response = await aiService.getHealthAdvice(q);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          content: response.success && response.content ? response.content : "I ran into an issue. Please try again.",
          type: response.success ? "ai" : "error",
        },
      ]);
    } catch {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), content: "Something went wrong. Please try again.", type: "error" }]);
      toast.error("Connection error.");
    } finally {
      setThinking(false);
    }
  }, [thinking, quota, searchWithContext]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
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
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  /* ── The input bar (shared — position changes based on hasMessages) ── */
  const InputBar = (
    <div
      className="w-full max-w-2xl relative rounded-2xl border shadow-sm transition-all focus-within:shadow-md"
      style={{ backgroundColor: "#fdf9f2", borderColor: "#e0d8cc" }}
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKey}
        placeholder="Ask anything about medications, symptoms, or healthcare..."
        rows={1}
        disabled={thinking}
        className="w-full resize-none bg-transparent text-[15px] text-gray-900 placeholder:text-gray-400 outline-none px-4 pt-4 pb-14 max-h-[200px] leading-relaxed"
      />
      <div className="absolute bottom-3 left-4 right-3 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">Shift+Enter for new line</span>
        <button
          onClick={() => send(input)}
          disabled={!input.trim() || thinking}
          className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-25 hover:bg-primary/90 transition-all text-lg leading-none"
          style={{ fontSize: "1.1rem" }}
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
      <aside
        className="flex flex-col h-full flex-shrink-0 border-r transition-all duration-300 overflow-hidden"
        style={{
          backgroundColor: "#f0ebe2",
          borderColor: "#e0d8cc",
          width: sidebarOpen ? "15rem" : "3.25rem",
          minWidth: sidebarOpen ? "15rem" : "3.25rem",
        }}
      >
        {/* Toggle button */}
        <div className="flex items-center px-3 pt-5 pb-4 gap-3">
          <button
            onClick={toggleSidebar}
            className="h-8 w-8 flex flex-col justify-center items-center gap-1.5 rounded-lg hover:bg-[#e4ddd0] transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            <span className="block h-px w-4 bg-gray-600 rounded-full" />
            <span className="block h-px w-4 bg-gray-600 rounded-full" />
            <span className="block h-px w-4 bg-gray-600 rounded-full" />
          </button>
          {sidebarOpen && (
            <Link to="/" className="text-[15px] font-semibold text-gray-900 tracking-tight whitespace-nowrap overflow-hidden">
              MedMed.AI
            </Link>
          )}
        </div>

        {/* New Chat */}
        <div className="px-2 mb-4">
          <button
            onClick={newChat}
            className="w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13.5px] text-gray-700 hover:bg-[#e4ddd0] transition-colors whitespace-nowrap"
            title="New conversation"
          >
            <span className="flex-shrink-0 text-lg leading-none font-light">+</span>
            {sidebarOpen && <span>New conversation</span>}
          </button>
        </div>

        {sidebarOpen && (
          <>
            <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 px-4 mb-1.5">Tools</p>
          </>
        )}

        {/* Nav links — text only, no icons */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
          {[
            { to: "/symptom-checker", label: "Symptom Checker" },
            { to: "/pharmacy-finder", label: "Pharmacy Finder" },
            { to: "/interaction-checker", label: "Interaction Checker" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              title={label}
              className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-gray-400" />
              {sidebarOpen && label}
            </Link>
          ))}

          {sidebarOpen && (
            <>
              <div className="pt-3 mt-3 border-t" style={{ borderColor: "#d8d0c0" }}>
                <p className="text-[10.5px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-1.5">Business</p>
              </div>
              {[
                { to: "/sponsor-portal", label: "Sponsor Portal" },
                { to: "/advertiser-enrollment", label: "Advertiser Access" },
              ].map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-3 px-2.5 py-2 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors"
                >
                  <span className="flex-shrink-0 h-1.5 w-1.5 rounded-full bg-gray-400" />
                  {label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Bottom user zone */}
        <div className="mt-auto px-2 py-4 border-t" style={{ borderColor: "#d8d0c0" }}>
          {user ? (
            sidebarOpen ? (
              <UserAvatarMenu user={{ name: user.name, email: user.email, tier: user.tier }} onSignOut={signOut} />
            ) : (
              <div className="h-8 w-8 mx-auto rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold">
                {(user.name?.[0] ?? user.email[0]).toUpperCase()}
              </div>
            )
          ) : sidebarOpen ? (
            <div className="space-y-0.5">
              <Link to="/signin" className="block px-2.5 py-2 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors">
                Sign in
              </Link>
              <Link to="/signup" className="block px-2.5 py-2 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors">
                Create account
              </Link>
            </div>
          ) : null}
        </div>
      </aside>

      {/* ── Main area ── */}
      <main className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">

        {!hasMessages ? (
          /* ── Welcome: input centered ── */
          <div className="flex flex-col items-center justify-center flex-1 px-6">
            <h1 className="text-3xl font-semibold text-gray-900 mb-8 tracking-tight">How can I help you?</h1>
            {InputBar}
            <p className="text-[11px] text-gray-400 mt-3 text-center">
              AI powered by Google Gemini · <Link to="/privacy" className="hover:text-gray-600">Privacy</Link> · <Link to="/terms" className="hover:text-gray-600">Terms</Link>
            </p>
          </div>
        ) : (
          /* ── Active chat: messages scroll, input pinned ── */
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

            {/* Input pinned to bottom */}
            <div className="flex-shrink-0 flex justify-center px-6 pb-5 pt-3">
              {InputBar}
            </div>
            <p className="text-center text-[11px] text-gray-400 pb-3">
              AI powered by Google Gemini · <Link to="/privacy" className="hover:text-gray-600">Privacy</Link> · <Link to="/terms" className="hover:text-gray-600">Terms</Link>
            </p>
          </>
        )}
      </main>

      {/* Upgrade modal */}
      {quota.showUpgradeModal && <UpgradeModal onClose={quota.dismissUpgradeModal} />}
    </div>
  );
};

export default Index;
