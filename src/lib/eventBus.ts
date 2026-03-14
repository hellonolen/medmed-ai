/**
 * MedMed.AI Event Bus
 * Lightweight pub/sub event system for cross-component agent communication.
 */

type Handler<T = unknown> = (payload: T) => void;

class EventBus {
  private listeners: Map<string, Set<Handler>> = new Map();

  on<T = unknown>(event: string, handler: Handler<T>): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler as Handler);
    // Return unsubscribe fn
    return () => this.listeners.get(event)?.delete(handler as Handler);
  }

  emit<T = unknown>(event: string, payload?: T): void {
    this.listeners.get(event)?.forEach(h => {
      try { h(payload as unknown); } catch (e) { console.error(`EventBus[${event}]:`, e); }
    });
  }

  off(event: string, handler?: Handler): void {
    if (handler) this.listeners.get(event)?.delete(handler);
    else this.listeners.delete(event);
  }
}

// Singleton — shared across the entire app
export const bus = new EventBus();

// ─── Event Type Catalog ──────────────────────────────────────────────────────
// Use these constants to avoid typo bugs in event names

export const AGENT_EVENTS = {
  // Agent → UI
  AGENT_THINKING:    "agent:thinking",      // agent started thinking
  AGENT_RESPONSE:    "agent:response",      // agent emitted a text response
  AGENT_SPEAKING:    "agent:speaking",      // TTS started
  AGENT_SILENT:      "agent:silent",        // TTS ended
  AGENT_PROACTIVE:   "agent:proactive",     // agent initiated unprompted message
  AGENT_TOOL_CALL:   "agent:tool_call",     // agent called a tool (pharmacy, etc.)

  // User → Agent
  USER_SPOKE:        "user:spoke",          // user said something (voice)
  USER_TYPED:        "user:typed",          // user typed a message
  USER_IMAGE:        "user:image",          // user shared a photo/video
  USER_PROFILE:      "user:profile",        // health profile loaded/updated

  // System
  SESSION_START:     "session:start",       // chat session initialized
  QUOTA_HIT:         "quota:hit",           // user hit usage limit
  ERROR:             "error",               // unhandled error
} as const;

export type AgentEvent = typeof AGENT_EVENTS[keyof typeof AGENT_EVENTS];
