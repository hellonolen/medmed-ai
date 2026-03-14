const BASE = 'https://api.medmed'

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function getToken(): string | null {
  return localStorage.getItem('mm_token')
}

export function setToken(t: string) {
  localStorage.setItem('mm_token', t)
}

export function clearToken() {
  localStorage.removeItem('mm_token')
}

export function decodeToken(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return null
  }
}

// ─── Fetch helper ─────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, opts: RequestInit = {}, auth = true): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  }
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }
  const res = await fetch(`${BASE}${path}`, { ...opts, headers })
  const data = await res.json() as T & { error?: string }
  if (!res.ok) throw new Error((data as { error?: string }).error || `HTTP ${res.status}`)
  return data
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface UserPayload {
  id: string; email: string; name: string | null; tier: string;
  trialExpires?: string; memberSince?: string; referralCode?: string
}

export async function apiSignup(name: string, email: string, password: string) {
  return apiFetch<{ token: string; user: UserPayload }>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  }, false)
}

export async function apiSignin(email: string, password: string) {
  return apiFetch<{ token: string; user: UserPayload }>('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  }, false)
}

export async function apiRequestReset(email: string) {
  return apiFetch<{ success: boolean }>('/api/auth/reset-request', {
    method: 'POST',
    body: JSON.stringify({ email, type: 'user' }),
  }, false)
}

// ─── AI chat ──────────────────────────────────────────────────────────────────

export interface ChatMessage { role: 'user' | 'model'; parts: [{ text: string }] }

export async function apiChat(query: string, history: ChatMessage[], userId?: string) {
  return apiFetch<{ success: boolean; content: string; results?: unknown[]; disclaimer?: string; provider?: string }>(
    '/api/ai',
    { method: 'POST', body: JSON.stringify({ query, history, userId }) }
  )
}

// ─── AI visual (camera) ───────────────────────────────────────────────────────

export interface MediaCapture {
  id: string;
  type: 'image' | 'video';
  analysis?: string;
  created_at: string;
}

export async function apiMediaUpload(file: File) {
  const buffer = await file.arrayBuffer()
  const res = await fetch(`${BASE}/api/media/upload`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type,
      'Authorization': `Bearer ${getToken()}`
    },
    body: buffer
  })
  const data = await res.json() as { id: string, key: string, error?: string }
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export async function apiMediaAnalyze(id: string, type: 'image' | 'video') {
  return apiFetch<{ analysis: string }>(
    '/api/media/analyze',
    { method: 'POST', body: JSON.stringify({ id, type }) }
  )
}

export async function apiGetMediaHistory() {
  return apiFetch<{ history: MediaCapture[] }>('/api/media/history')
}

// ─── Sessions / History ───────────────────────────────────────────────────────

export interface Session {
  id: string; title: string; preview: string; tool: string;
  created_at: string; message_count?: number
}

export async function apiGetSessions(): Promise<Session[]> {
  const res = await apiFetch<{ sessions?: Session[] }>('/api/sessions')
  return res.sessions || []
}

export async function apiCreateSession(title: string, tool = 'Chat') {
  return apiFetch<{ session: Session & { id: string } }>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({ title, tool }),
  })
}

export async function apiGetSession(id: string) {
  return apiFetch<{ session: Session; messages: ChatMessage[] }>(`/api/sessions/${id}`)
}

// ─── User / Account ───────────────────────────────────────────────────────────

export async function apiGetMe() {
  return apiFetch<{ user: UserPayload }>('/api/user/me')
}

// ─── Whop checkout ────────────────────────────────────────────────────────────

export async function apiCheckoutSession(plan: string, seats = 1) {
  return apiFetch<{ checkoutUrl: string }>('/api/checkout/session', {
    method: 'POST',
    body: JSON.stringify({ plan, seats }),
  })
}
