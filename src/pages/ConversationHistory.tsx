import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const WORKER = "https://medmed-agent.hellonolen.workers.dev";

interface Conversation { id: string; title: string; created_at: string; updated_at: string; }
interface Message { id: string; role: "user" | "assistant"; content: string; created_at: string; }

export default function ConversationHistory() {
  const { user } = useAuth();
  const token = localStorage.getItem("medmed_token");
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const hdrs = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!token) return;
    fetch(`${WORKER}/api/conversations`, { headers: hdrs })
      .then(r => r.json() as Promise<{ conversations: Conversation[] }>)
      .then(d => setConvs(d.conversations || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const openConversation = async (conv: Conversation) => {
    setSelected(conv);
    setLoadingMsgs(true);
    try {
      const d = await fetch(`${WORKER}/api/conversations?id=${conv.id}`, { headers: hdrs })
        .then(r => r.json() as Promise<{ messages: Message[] }>);
      setMessages(d.messages || []);
    } catch { setMessages([]); }
    setLoadingMsgs(false);
  };

  const cardStyle = { backgroundColor: "#fdf9f2", border: "1px solid #e0d8cc" };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400 text-[14px]">Loading…</div>;

  if (!convs.length) return (
    <div className="max-w-2xl mx-auto px-6 py-10 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-3">Conversation History</h1>
      <p className="text-[14px] text-gray-500 mb-6">Your saved conversations will appear here. Conversations are automatically saved when you close the chat.</p>
      <Link to="/chat" className="px-6 py-3 rounded-xl bg-primary text-white text-[14px] font-semibold hover:bg-primary/90 transition-colors">
        Start a conversation
      </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 w-full">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Conversation History</h1>
      <div className="flex gap-6">
        {/* List */}
        <aside className="w-64 flex-shrink-0 space-y-2">
          {convs.map(c => (
            <button key={c.id} onClick={() => openConversation(c)} className="w-full text-left rounded-xl p-3 transition-colors hover:bg-[#e4ddd0]"
              style={selected?.id === c.id ? { backgroundColor: "#e4ddd0" } : {}}>
              <p className="text-[13px] font-medium text-gray-900 truncate">{c.title || "Conversation"}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{new Date(c.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </button>
          ))}
        </aside>

        {/* Conversation view */}
        <div className="flex-1 rounded-2xl p-6" style={cardStyle}>
          {!selected ? (
            <p className="text-[14px] text-gray-400 text-center mt-12">Select a conversation to view it</p>
          ) : loadingMsgs ? (
            <p className="text-[14px] text-gray-400 text-center mt-12">Loading…</p>
          ) : (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
              <h2 className="text-[14px] font-semibold text-gray-900 mb-4 sticky top-0 pb-2" style={{ backgroundColor: "#fdf9f2" }}>{selected.title}</h2>
              {messages.map(m => (
                <div key={m.id} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${m.role === 'user' ? 'text-white' : 'text-gray-800'}`}
                    style={{ backgroundColor: m.role === 'user' ? '#7c3aed' : '#ede8de' }}>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
