/**
 * AgentContext — MedMed.AI Agentic Brain
 *
 * Provides:
 * - Central agent state (thinking, speaking, lastResponse)
 * - Proactive message scheduling (health reminders, follow-ups)
 * - Tool dispatch (symptom check, pharmacy search, interaction check)
 * - Event bus wiring across the entire session
 */

import {
  createContext, useContext, useState, useEffect, useRef,
  useCallback, ReactNode
} from "react";
import { bus, AGENT_EVENTS } from "@/lib/eventBus";
import { useAuth } from "@/contexts/AuthContext";

const WORKER = "https://medmed-agent.hellonolen.workers.dev";

interface AgentState {
  thinking: boolean;
  speaking: boolean;
  activeToolCall: string | null;
  lastResponse: string;
  sessionId: string;
}

interface ProactiveMessage {
  id: string;
  text: string;
  at: number; // timestamp ms
}

interface AgentContextValue {
  agent: AgentState;
  sendToAgent: (query: string, systemPrompt?: string) => Promise<string>;
  dispatchProactive: (message: string) => void;
  pendingProactive: ProactiveMessage[];
  clearProactive: (id: string) => void;
}

const AgentCtx = createContext<AgentContextValue | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const token = localStorage.getItem("medmed_token");
  const userId = (user as { id?: string } | null)?.id;

  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [activeToolCall, setActiveToolCall] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState("");
  const [pendingProactive, setPendingProactive] = useState<ProactiveMessage[]>([]);
  const sessionId = useRef(`session_${Date.now()}`);
  const proactiveTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hasGreeted = useRef(false);

  // ── Listen to bus events
  useEffect(() => {
    const unsubs = [
      bus.on(AGENT_EVENTS.AGENT_SPEAKING, () => setSpeaking(true)),
      bus.on(AGENT_EVENTS.AGENT_SILENT,   () => setSpeaking(false)),
      bus.on(AGENT_EVENTS.AGENT_THINKING, () => setThinking(true)),
    ];
    return () => unsubs.forEach(u => u());
  }, []);

  // ── Proactive follow-up messages based on health profile
  useEffect(() => {
    if (!userId || hasGreeted.current) return;
    hasGreeted.current = true;

    const schedule = async () => {
      // Fetch health profile to personalize proactive messages
      try {
        const res = await fetch(`${WORKER}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { profile } = await res.json() as { profile?: { conditions?: string; medications?: string } };

        const msgs: Array<{ delay: number; text: string }> = [];

        // 30 seconds: health context reminder
        if (profile?.medications) {
          msgs.push({
            delay: 30_000,
            text: `👋 Hi! I noticed you're tracking medications. Would you like me to check for any interactions or set a reminder?`,
          });
        } else {
          msgs.push({
            delay: 45_000,
            text: `👋 I'm here and ready to help. Ask me anything about medications, symptoms, or health questions — or share a photo and I'll take a look.`,
          });
        }

        // 3 minutes: follow-up if no messages sent
        msgs.push({
          delay: 180_000,
          text: `Just checking in — is there anything you'd like me to research or help clarify about your health today?`,
        });

        msgs.forEach(({ delay, text }) => {
          const t = setTimeout(() => {
            const id = `proactive_${Date.now()}`;
            setPendingProactive(prev => [...prev, { id, text, at: Date.now() }]);
            bus.emit(AGENT_EVENTS.AGENT_PROACTIVE, { id, text });
          }, delay);
          proactiveTimers.current.push(t);
        });
      } catch {
        // Silently skip proactive on error
      }
    };

    schedule();

    return () => {
      proactiveTimers.current.forEach(t => clearTimeout(t));
      proactiveTimers.current = [];
    };
  }, [userId, token]);

  // ── Core agent call
  const sendToAgent = useCallback(async (query: string, systemPrompt?: string): Promise<string> => {
    bus.emit(AGENT_EVENTS.AGENT_THINKING);
    setThinking(true);
    setActiveToolCall(null);

    try {
      // Detect tool intent from query
      const lower = query.toLowerCase();
      if (lower.includes("pharmacy") || lower.includes("find") || lower.includes("near me")) {
        setActiveToolCall("pharmacy_search");
        bus.emit(AGENT_EVENTS.AGENT_TOOL_CALL, "pharmacy_search");
      } else if (lower.includes("interact") || lower.includes("combine")) {
        setActiveToolCall("interaction_check");
        bus.emit(AGENT_EVENTS.AGENT_TOOL_CALL, "interaction_check");
      } else if (lower.includes("symptom") || lower.includes("feel") || lower.includes("pain")) {
        setActiveToolCall("symptom_assess");
        bus.emit(AGENT_EVENTS.AGENT_TOOL_CALL, "symptom_assess");
      }

      const res = await fetch(`${WORKER}/api/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          query,
          systemPrompt,
          userId,
          sessionId: sessionId.current,
        }),
      });

      const data = await res.json() as { content?: string; success?: boolean };
      const response = data.content || "I couldn't process that. Please try again.";
      setLastResponse(response);
      bus.emit(AGENT_EVENTS.AGENT_RESPONSE, response);
      return response;
    } catch {
      const fallback = "I'm having trouble connecting right now. Please try again in a moment.";
      bus.emit(AGENT_EVENTS.AGENT_RESPONSE, fallback);
      return fallback;
    } finally {
      setThinking(false);
      setActiveToolCall(null);
    }
  }, [userId, token]);

  const dispatchProactive = useCallback((message: string) => {
    const id = `proactive_${Date.now()}`;
    setPendingProactive(prev => [...prev, { id, text: message, at: Date.now() }]);
    bus.emit(AGENT_EVENTS.AGENT_PROACTIVE, { id, text: message });
  }, []);

  const clearProactive = useCallback((id: string) => {
    setPendingProactive(prev => prev.filter(m => m.id !== id));
  }, []);

  const agent: AgentState = {
    thinking,
    speaking,
    activeToolCall,
    lastResponse,
    sessionId: sessionId.current,
  };

  return (
    <AgentCtx.Provider value={{ agent, sendToAgent, dispatchProactive, pendingProactive, clearProactive }}>
      {children}
    </AgentCtx.Provider>
  );
}

export function useAgent() {
  const ctx = useContext(AgentCtx);
  if (!ctx) throw new Error("useAgent must be used inside AgentProvider");
  return ctx;
}
