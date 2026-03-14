import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send, ArrowUp, Loader2, Sparkles, AlertTriangle, Plus, Clipboard, Map, Activity, LogIn, UserPlus, Settings, ChevronRight } from "lucide-react";
import { useAdmin } from "@/contexts/AdminContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { aiService } from "@/services/AIService";
import { useMedicalSearch } from "@/contexts/MedicalSearchContext";
import { toast } from "sonner";

interface Message {
  content: string;
  type: "ai" | "user" | "error";
  id: string;
}

const STARTERS = [
  { label: "Side effects of ibuprofen", q: "What are the side effects of ibuprofen?" },
  { label: "Pharmacies near Chicago", q: "Find pharmacies near Chicago" },
  { label: "Ozempic vs Wegovy", q: "Compare Ozempic and Wegovy for weight loss" },
  { label: "High blood pressure meds", q: "What medications treat high blood pressure?" },
];

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

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [chatId, setChatId] = useState(0); // increment to reset
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useLanguage();
  const { searchWithContext } = useMedicalSearch();
  const navigate = useNavigate();
  const { tier, isSubscribed } = useSubscription();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (query: string) => {
    if (!query.trim() || thinking) return;
    const q = query.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const userMsg: Message = { content: q, type: "user", id: crypto.randomUUID() };
    setMessages((prev) => [...prev, userMsg]);
    setThinking(true);

    try {
      const normalizedInput = q.toLowerCase();
      const isLocationSearch =
        /\b(in|near|at|around)\b/.test(normalizedInput) ||
        /\b(new york|los angeles|chicago|houston|miami|boston|atlanta|seattle|denver|dallas|phoenix|philadelphia)\b/i.test(normalizedInput);

      // Fire search in background for results (don't block chat)
      searchWithContext(q, isLocationSearch ? "location" : undefined).catch(() => {});

      const response = await aiService.getHealthAdvice(q);
      setMessages((prev) => [
        ...prev,
        {
          content: response.success && response.content ? response.content : "I ran into an issue. Please try again.",
          type: response.success ? "ai" : "error",
          id: crypto.randomUUID(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { content: "Something went wrong. Please try again.", type: "error", id: crypto.randomUUID() },
      ]);
      toast.error("Connection error.");
    } finally {
      setThinking(false);
    }
  };

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
    setChatId((n) => n + 1);
    setInput("");
    textareaRef.current?.focus();
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: "#faf8f4", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside
        className="hidden md:flex flex-col w-64 h-full flex-shrink-0 border-r"
        style={{ backgroundColor: "#f0ebe2", borderColor: "#e0d8cc" }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-[15px] text-gray-900 tracking-tight">MedMed.AI</span>
          </Link>
        </div>

        {/* New Chat */}
        <div className="px-3 mb-4">
          <button
            onClick={newChat}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-[#e4ddd0] transition-colors"
          >
            <Plus className="h-4 w-4" />
            New conversation
          </button>
        </div>

        <div className="px-3 mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-1.5">Tools</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {[
            { to: "/symptom-checker", icon: Clipboard, label: "Symptom Checker" },
            { to: "/pharmacy-finder", icon: Map, label: "Pharmacy Finder" },
            { to: "/interaction-checker", icon: Activity, label: "Interaction Checker" },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors"
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          ))}

          <div className="pt-3 mt-3 border-t" style={{ borderColor: "#d8d0c0" }}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-1.5">Business</p>
            {[
              { to: "/sponsor-portal", label: "Sponsor Portal" },
              { to: "/advertiser-enrollment", label: "Advertiser Access" },
            ].map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                {label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="mt-auto px-3 py-4 border-t space-y-0.5" style={{ borderColor: "#d8d0c0" }}>
          {isSubscribed && (
            <div className="px-3 py-2 mb-2 rounded-xl bg-primary/10 text-primary text-xs font-medium">
              {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan Active
            </div>
          )}
          <Link
            to="/signin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </Link>
          <Link
            to="/signup"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Create Account
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] text-gray-600 hover:bg-[#e4ddd0] hover:text-gray-900 transition-colors"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="flex flex-col flex-1 h-full min-w-0">

        {/* Scrollable messages */}
        <div className="flex-1 overflow-y-auto">
          {!hasMessages ? (
            /* Welcome screen */
            <div className="flex flex-col items-center justify-center min-h-full px-6 py-16">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 mb-2 tracking-tight">
                How can I help you?
              </h1>
              <p className="text-[15px] text-gray-500 mb-10 text-center max-w-md">
                Ask about medications, symptoms, find pharmacies, or get healthcare information worldwide.
              </p>

              {/* Starter grid */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-xl">
                {STARTERS.map(({ label, q }) => (
                  <button
                    key={label}
                    onClick={() => send(q)}
                    className="text-left px-4 py-3.5 rounded-xl border text-[13.5px] text-gray-700 hover:text-gray-900 transition-all"
                    style={{ backgroundColor: "#fdf9f2", borderColor: "#e0d8cc" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#f5ede0")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#fdf9f2")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message thread */
            <div className="max-w-3xl mx-auto w-full px-6 py-8 space-y-8">
              {messages.map((msg) => (
                <div key={msg.id}>
                  {msg.type === "user" ? (
                    <div className="flex justify-end">
                      <div
                        className="max-w-[75%] px-4 py-3 rounded-2xl rounded-br-sm text-[15px] leading-relaxed text-gray-900"
                        style={{ backgroundColor: "#ede8de" }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ) : msg.type === "error" ? (
                    <div className="flex gap-3 items-start">
                      <div className="flex-shrink-0 h-7 w-7 mt-0.5 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                      </div>
                      <p className="text-[15px] text-destructive leading-relaxed pt-0.5">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="flex gap-4 items-start">
                      <div className="flex-shrink-0 h-7 w-7 mt-0.5 rounded-full bg-primary/10 border border-primary/10 flex items-center justify-center">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <div
                        className="flex-1 text-[15px] leading-[1.75] text-gray-800 min-w-0"
                        dangerouslySetInnerHTML={{ __html: `<p>${renderMd(msg.content)}</p>` }}
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {thinking && (
                <div className="flex gap-4 items-start">
                  <div className="flex-shrink-0 h-7 w-7 mt-0.5 rounded-full bg-primary/10 border border-primary/10 flex items-center justify-center">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5 pt-2">
                    {[0, 160, 320].map((d) => (
                      <span
                        key={d}
                        className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input bar pinned to bottom ── */}
        <div className="flex-shrink-0 px-4 pb-5 pt-3">
          <div
            className="max-w-3xl mx-auto rounded-2xl border shadow-sm transition-shadow focus-within:shadow-md relative"
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
                className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center disabled:opacity-25 hover:bg-primary/90 transition-all"
              >
                {thinking
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : <ArrowUp className="h-4 w-4" />
                }
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] text-gray-400 mt-2">
            MedMed.AI provides information only — not medical advice. Always consult a healthcare professional.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
