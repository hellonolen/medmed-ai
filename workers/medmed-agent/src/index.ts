/**
 * MedMed.AI — Cloudflare Worker Agentic Brain (Production v2)
 *
 * Secrets (set via `wrangler secret put`):
 *   GOOGLE_GENAI_API_KEY
 *   JWT_SECRET
 *   POSTMARK_SERVER_TOKEN
 *   STRIPE_SECRET_KEY                  ← add this
 *   STRIPE_WEBHOOK_SECRET               ← add this
 *   ADMIN_SECRET                        ← add this (master password to enable owner mode)
 */

export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  GOOGLE_GENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  OPENAI_API_KEY: string;
  GLM_API_KEY: string;
  PERPLEXITY_API_KEY: string;
  JWT_SECRET: string;
  POSTMARK_SERVER_TOKEN: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  ADMIN_SECRET: string;
  WORKER_ENV: string;
}

// ─── CORS ─────────────────────────────────────────────────────────────────────

function corsHeaders(origin: string = '*'): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

function json(data: unknown, status = 200, origin?: string): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function err(message: string, status = 400, origin?: string): Response {
  return json({ error: message }, status, origin);
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const hashBuffer = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, storedHash] = stored.split(':');
  const encoder = new TextEncoder();
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h: string) => parseInt(h, 16)));
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const hashBuffer = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
  const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === storedHash;
}

async function createJWT(payload: Record<string, unknown>, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  const body = btoa(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp }));
  const unsigned = `${header}.${body}`;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(unsigned));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${unsigned}.${sigB64}`;
}

async function verifyJWT(token: string, secret: string): Promise<Record<string, any> | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const unsigned = `${parts[0]}.${parts[1]}`;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
    const sig = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(unsigned));
    if (!valid) return null;
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function getAuthToken(req: Request): string | null {
  const auth = req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

// ─── Gemini ───────────────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-2.0-flash';

// ─── Build personalized system prompt with user health profile ────────────────

async function buildPersonalizedPrompt(db: D1Database, userId: string | null): Promise<string> {
  const base = `You are MedMed AI, an intelligent health information assistant.
Help users with: medication info, pharmacy discovery, symptom context, drug interactions, and general health education.
RULES: Always include appropriate educational disclaimers. Never diagnose. Recommend consulting a healthcare professional for personal medical decisions.
For location-based searches return structured JSON:
\`\`\`json
{"results":[{"name":"...","details":"...","price":"...","type":"Medication|Pharmacy|Specialist","source":"...","phone":"...","address":"..."}],"answer":"...","disclaimer":"..."}
\`\`\``;

  if (!userId) return base;

  try {
    const profile = await db.prepare(`SELECT * FROM health_profiles WHERE user_id = ?`).bind(userId).first<any>();
    if (!profile) return base;

    const parts: string[] = [];
    if (profile.age || profile.sex) parts.push(`Age: ${profile.age || 'unknown'}, Sex: ${profile.sex || 'unknown'}`);
    if (profile.weight_lbs) parts.push(`Weight: ${profile.weight_lbs} lbs`);
    const conditions = JSON.parse(profile.conditions || '[]');
    const allergies = JSON.parse(profile.allergies || '[]');
    const meds = JSON.parse(profile.current_meds || '[]');
    if (conditions.length) parts.push(`Known conditions: ${conditions.join(', ')}`);
    if (allergies.length) parts.push(`Allergies: ${allergies.join(', ')}`);
    if (meds.length) parts.push(`Current medications: ${meds.join(', ')}`);
    if (profile.notes) parts.push(`Notes: ${profile.notes}`);

    if (!parts.length) return base;
    return `${base}\n\n--- USER HEALTH PROFILE (use this context to personalize responses) ---\n${parts.join('\n')}\n--- END PROFILE ---`;
  } catch {
    return base;
  }
}

const MEDICAL_SYSTEM_PROMPT = `You are MedMed AI, an intelligent health information assistant.
Help users with: medication info, pharmacy discovery, symptom context, drug interactions, and general health education.
RULES: Always include appropriate educational disclaimers. Never diagnose. Recommend consulting a healthcare professional for personal medical decisions.
For location-based searches return structured JSON:
\`\`\`json
{"results":[{"name":"...","details":"...","price":"...","type":"Medication|Pharmacy|Specialist","source":"...","phone":"...","address":"..."}],"answer":"...","disclaimer":"..."}
\`\`\``;

async function callGeminiWithModel(apiKey: string, model: string, systemPrompt: string, userMessage: string, history: unknown[] = []): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [...history, { role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// Backward-compat shim
async function callGemini(apiKey: string, systemPrompt: string, userMessage: string, history: unknown[] = []): Promise<string> {
  return callGeminiWithModel(apiKey, GEMINI_MODEL, systemPrompt, userMessage, history);
}

// ─── Claude (Anthropic) ───────────────────────────────────────────────────────

async function callClaude(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });
  if (!res.ok) throw new Error(`Claude ${res.status}`);
  const data = await res.json() as { content?: Array<{ type: string; text?: string }> };
  return data.content?.find(b => b.type === 'text')?.text || '';
}

// ─── GPT-4o (OpenAI) ─────────────────────────────────────────────────────────

async function callGPT(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });
  if (!res.ok) throw new Error(`GPT ${res.status}`);
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content || '';
}

// ─── GLM-4 (Zhipu AI — OpenAI-compatible) ────────────────────────────────────

async function callGLM(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const res = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'glm-4-flash',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });
  if (!res.ok) throw new Error(`GLM ${res.status}`);
  const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content || '';
}


// ─── Perplexity (Sonar Pro — OpenAI-compatible + real-time web search) ──────────

async function callPerplexity(apiKey: string, systemPrompt: string, userMessage: string): Promise<string> {
  const res = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'sonar-pro',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      search_domain_filter: ['medlineplus.gov', 'pubmed.ncbi.nlm.nih.gov', 'drugs.com', 'webmd.com', 'mayoclinic.org'],
      return_citations: true,
      temperature: 0.2,
    }),
  });
  if (!res.ok) throw new Error(`Perplexity ${res.status}`);
  const data = await res.json() as {
    choices?: Array<{ message?: { content?: string } }>;
    citations?: string[];
  };
  const content = data.choices?.[0]?.message?.content || '';
  const citations = data.citations?.slice(0, 3);
  if (citations?.length) return `${content}\n\n**Sources:** ${citations.map((c, i) => `[${i + 1}] ${c}`).join(' · ')}`;
  return content;
}

// ─── Conductor: Routes each query to the best model ───────────────────────────
//
// Routing rules:
//  gemini     → vision, quick medical lookup, pharmacy search, image analysis
//  claude     → complex reasoning, differential diagnosis, nuanced multi-step analysis
//  gpt        → patient education, drug explanations, treatment summaries
//  glm        → multilingual/Chinese queries, traditional/alternative medicine
//  perplexity → research questions, evidence-based queries, "latest studies", "current guidelines"
//
// Video is ALWAYS handled by Gemini (vision only) — see handleMediaVisual.

async function conductorRoute(
  apiKey: string,
  query: string,
  env: Env
): Promise<{ model: 'gemini' | 'claude' | 'gpt' | 'glm' | 'perplexity'; reason: string }> {
  const conductorPrompt = `You are the medmed.ai Conductor — an intelligent AI routing agent.
Your ONLY job: analyze a health question and return JSON selecting the best AI model.

Models and their strengths:
- gemini: vision/image analysis, pharmacy lookup, quick medical facts, multimodal
- claude: complex multi-step reasoning, differential diagnosis, deep clinical analysis
- gpt: clear patient education, drug information, general health summaries
- glm: Chinese/multilingual queries, traditional medicine, alternative health
- perplexity: research questions, "what does the latest research say", evidence-based medicine, clinical guidelines, PubMed queries

IMPORTANT:
- If the query involves images or camera: always return gemini
- If query mentions "research", "studies", "evidence", "guideline", "latest", "published": prefer perplexity
- For complex diagnosis or reasoning: prefer claude
- For patient-friendly explanations: prefer gpt

Respond ONLY with valid JSON, no markdown:
{"model":"gemini|claude|gpt|glm|perplexity","reason":"one sentence"}
Fallback: return gemini if uncertain.`;

  try {
    const raw = await callGeminiWithModel(
      apiKey,
      'gemini-2.0-flash',
      conductorPrompt,
      `Route this query: "${query.slice(0, 600)}"`
    );
    // Strip markdown code fences if present
    const clean = raw.trim().replace(/^```(?:json)?\n?|\n?```$/g, '').trim();
    const parsed = JSON.parse(clean) as { model: string; reason: string };
    const valid = ['gemini', 'claude', 'gpt', 'glm', 'perplexity'];
    if (valid.includes(parsed.model)) {
      const m = parsed.model;
      // Fallback to gemini if provider key not configured
      if (m === 'claude'     && !env.ANTHROPIC_API_KEY)  return { model: 'gemini', reason: 'Claude key not configured' };
      if (m === 'gpt'        && !env.OPENAI_API_KEY)      return { model: 'gemini', reason: 'GPT key not configured' };
      if (m === 'glm'        && !env.GLM_API_KEY)         return { model: 'gemini', reason: 'GLM key not configured' };
      if (m === 'perplexity' && !env.PERPLEXITY_API_KEY) return { model: 'gemini', reason: 'Perplexity key not configured' };
      return { model: m as 'gemini' | 'claude' | 'gpt' | 'glm' | 'perplexity', reason: parsed.reason };
    }
  } catch { /* fall through */ }
  return { model: 'gemini', reason: 'default' };
}

async function sendEmail(token: string, to: string, subject: string, html: string, text: string): Promise<void> {
  if (!token) return;
  await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-Postmark-Server-Token': token },
    body: JSON.stringify({ From: 'noreply@medmed.ai', To: to, Subject: subject, HtmlBody: html, TextBody: text, MessageStream: 'outbound' }),
  });
}

// ─── /api/ai ─────────────────────────────────────────────────────────────────
//
// ARCHITECTURE: Gemini is the platform foundation.
//   - Voice, video, and image: always Gemini (handled by Gemini Live / handleMediaVisual)
//   - Text queries: Gemini by default; conductor may augment with Claude/GPT/GLM/Perplexity
//     when a better model is available for that query type.
//
// BYOA keys stored as JSON: {"gemini":"...","anthropic":"...","openai":"...","glm":"...","perplexity":"..."}

async function handleAI(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: Record<string, unknown>;
  try { body = await req.json() as Record<string, unknown>; } catch { return err('Invalid JSON', 400, origin); }
  const query       = body.query       as string | undefined;
  const systemPrompt = body.systemPrompt as string | undefined;
  const history     = (body.history    as unknown[]) || [];
  const searchType  = body.searchType  as string | undefined;
  const userId      = body.userId      as string | undefined;
  if (!query) return err('query required', 400, origin);
  if (!env.GOOGLE_GENAI_API_KEY) return err('AI not configured', 503, origin);

  try {
    // ── BYOA: load per-provider keys for eligible plans ──
    type ByoaKeys = Partial<Record<'gemini'|'anthropic'|'openai'|'glm'|'perplexity', string>>;
    let byoaKeys: ByoaKeys = {};
    if (userId) {
      const row = await env.DB.prepare('SELECT tier, api_key FROM users WHERE id = ?')
        .bind(userId).first<{ tier: string; api_key?: string }>().catch(() => null);
      if (row && ['enterprise', 'max', 'business'].includes(row.tier) && row.api_key) {
        try { byoaKeys = JSON.parse(row.api_key) as ByoaKeys; }
        catch { byoaKeys = { gemini: row.api_key }; } // legacy single key
      }
    }

    // ── System prompt ──
    let prompt = systemPrompt || (userId ? await buildPersonalizedPrompt(env.DB, userId) : MEDICAL_SYSTEM_PROMPT);
    if (searchType === 'location') prompt += '\n\nReturn structured JSON with nearby providers.';

    // ── Conductor: route text to best model ──
    // Gemini is always the fallback/base. Other models are optional augmentation.
    const { model: chosen, reason } = await conductorRoute(env.GOOGLE_GENAI_API_KEY, query, env);

    let raw = '';
    let providerLabel: string;

    if (chosen === 'claude') {
      const key = byoaKeys.anthropic || env.ANTHROPIC_API_KEY;
      raw = await callClaude(key, prompt, query);
      providerLabel = 'claude-3-7-sonnet';
    } else if (chosen === 'gpt') {
      const key = byoaKeys.openai || env.OPENAI_API_KEY;
      raw = await callGPT(key, prompt, query);
      providerLabel = 'gpt-4o';
    } else if (chosen === 'glm') {
      const key = byoaKeys.glm || env.GLM_API_KEY;
      raw = await callGLM(key, prompt, query);
      providerLabel = 'glm-4-flash';
    } else if (chosen === 'perplexity') {
      const key = byoaKeys.perplexity || env.PERPLEXITY_API_KEY;
      raw = await callPerplexity(key, prompt, query);
      providerLabel = 'perplexity-sonar-pro';
    } else {
      // Gemini — the platform foundation. Uses admin-selected Gemini model.
      const modelRow = await env.DB.prepare(`SELECT value FROM global_settings WHERE key = 'active_model'`)
        .first<{ value: string }>().catch(() => null);
      const geminiModel = modelRow?.value || 'gemini-2.0-flash';
      const key = byoaKeys.gemini || env.GOOGLE_GENAI_API_KEY;
      raw = await callGeminiWithModel(key, geminiModel, prompt, query, history);
      providerLabel = `gemini/${geminiModel}`;
    }

    // ── Usage tracking ──
    await env.DB.prepare(`UPDATE global_stats SET value = value + 1 WHERE key = 'total_questions'`)
      .run().catch(() => {});

    // ── Parse JSON structured response if wrapped in code fence ──
    const jsonMatch = raw.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return json({
          success: true,
          content: parsed.answer || raw.replace(/```json[\s\S]*?```/g, '').trim(),
          results: parsed.results || [],
          disclaimer: parsed.disclaimer || null,
          provider: providerLabel,
          routingReason: reason,
        }, 200, origin);
      } catch { /* fall through */ }
    }
    return json({ success: true, content: raw, results: [], disclaimer: null, provider: providerLabel, routingReason: reason }, 200, origin);
  } catch {
    // Gemini is the ultimate fallback — always available
    const key = env.GOOGLE_GENAI_API_KEY;
    try {
      const fallback = await callGemini(key, MEDICAL_SYSTEM_PROMPT, query, history);
      return json({ success: true, content: fallback, provider: 'gemini/fallback' }, 200, origin);
    } catch {
      return json({ success: false, content: 'AI temporarily unavailable.', provider: 'gemini' }, 200, origin);
    }
  }
}


// ─── /api/admin/config ─────────────────────────────────────────────────────────

async function handleAdminConfig(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const auth = req.headers.get('Authorization') || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const payload = await verifyJWT(token, env.JWT_SECRET).catch(() => null);
  if (!payload || payload.role !== 'admin') {
    // Also accept direct secret for simplicity
    if (token !== env.ADMIN_SECRET) return err('Unauthorized', 401, origin);
  }

  if (req.method === 'GET') {
    const row = await env.DB.prepare(`SELECT value FROM global_settings WHERE key = 'active_model'`).first<{ value: string }>().catch(() => null);
    return json({ config: { activeModel: row?.value || 'gemini-2.0-flash' } }, 200, origin);
  }

  if (req.method === 'POST') {
    const body = await req.json() as { activeModel?: string };
    const model = body.activeModel;
    if (!model) return err('activeModel required', 400, origin);
    const allowed = ['gemini-2.0-flash', 'gemini-2.0-flash-thinking-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    if (!allowed.includes(model)) return err('Invalid model', 400, origin);
    await env.DB.prepare(`INSERT INTO global_settings (key, value) VALUES ('active_model', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).bind(model).run();
    return json({ ok: true, activeModel: model }, 200, origin);
  }

  return err('Method not allowed', 405, origin);
}

// ─── /api/user/apikey ──────────────────────────────────────────────────────────

async function handleUserApiKey(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const token = getAuthToken(req);
  if (!token) return err('Unauthorized', 401, origin);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return err('Invalid token', 401, origin);
  const userId = payload.sub as string;

  // Verify tier eligibility
  const userRow = await env.DB.prepare('SELECT tier FROM users WHERE id = ?').bind(userId).first<{ tier: string }>().catch(() => null);
  const eligible = userRow && ['enterprise', 'max', 'business'].includes(userRow.tier);

  if (req.method === 'GET') {
    if (!eligible) return json({ apiKey: null, eligible: false }, 200, origin);
    const row = await env.DB.prepare('SELECT api_key FROM users WHERE id = ?').bind(userId).first<{ api_key?: string }>().catch(() => null);
    // Mask the key for display: show first 8 chars only
    const masked = row?.api_key ? row.api_key.slice(0, 8) + '••••••••••••••••' : null;
    return json({ apiKey: masked, eligible: true }, 200, origin);
  }

  if (!eligible) return err('Enterprise or Max plan required for BYOA', 403, origin);

  if (req.method === 'POST') {
    const body = await req.json() as { apiKey?: string };
    const key = body.apiKey?.trim();
    if (!key || !key.startsWith('AIza')) return err('Invalid Gemini API key format', 400, origin);
    await env.DB.prepare('UPDATE users SET api_key = ? WHERE id = ?').bind(key, userId).run();
    return json({ ok: true }, 200, origin);
  }

  if (req.method === 'DELETE') {
    await env.DB.prepare('UPDATE users SET api_key = NULL WHERE id = ?').bind(userId).run();
    return json({ ok: true }, 200, origin);
  }

  return err('Method not allowed', 405, origin);
}

// ─── /api/search ──────────────────────────────────────────────────────────────

async function handleSearch(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { query, searchType, language } = body;
  if (!query) return err('query required', 400, origin);
  if (!env.GOOGLE_GENAI_API_KEY) return err('AI not configured', 503, origin);
  try {
    const prompt = `You are MedMed AI search. Query: "${query}". Type: ${searchType||'general'}. Language: ${language||'en'}.
Return ONLY a JSON array of 6-10 results, each with: name, details (1-2 sentences), price, type (Tablet|Capsule|Injection|Pharmacy|Med Spa|Specialist|Cream|Other), source, phone (or null), address (or null). No other text.`;
    const raw = await callGemini(env.GOOGLE_GENAI_API_KEY, prompt, query);
    const arrayMatch = raw.match(/\[[\s\S]*\]/);
    let results = [];
    if (arrayMatch) { try { results = JSON.parse(arrayMatch[0]); } catch { results = []; } }
    return json({ success: true, results }, 200, origin);
  } catch {
    return json({ success: false, results: [] }, 200, origin);
  }
}

// ─── /api/auth/signup ─────────────────────────────────────────────────────────

async function handleSignup(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { email, password, name, referralCode } = body;
  if (!email || !password) return err('email and password required', 400, origin);
  if (password.length < 8) return err('Password must be at least 8 characters', 400, origin);
  try {
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();
    const now = new Date().toISOString();
    // 3-day trial
    const trialExpires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    // Unique referral code for this user
    const myReferralCode = `${(name || email).split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 8)}-${crypto.randomUUID().split('-')[0]}`;

    // Check referral code
    let referredBy: string | null = null;
    if (referralCode) {
      const referrer = await env.DB.prepare(`SELECT id FROM users WHERE referral_code = ?`).bind(referralCode).first<any>();
      if (referrer) referredBy = referrer.id;
    }

    await env.DB.prepare(`INSERT INTO users (id, email, name, password_hash, tier, trial_expires_at, referral_code, referred_by, created_at) VALUES (?, ?, ?, ?, 'free', ?, ?, ?, ?)`)
      .bind(userId, email.toLowerCase(), name || null, passwordHash, trialExpires, myReferralCode, referredBy, now).run();

    // Create empty health profile
    await env.DB.prepare(`INSERT INTO health_profiles (user_id) VALUES (?)`).bind(userId).run();

    // Update global user count
    await env.DB.prepare(`UPDATE global_stats SET value = value + 1 WHERE key = 'total_users'`).run().catch(() => {});

    // If referred, record referral and grant bonus to referrer
    if (referredBy) {
      await env.DB.prepare(`INSERT INTO referrals (referrer_id, referred_email, referred_id) VALUES (?, ?, ?)`)
        .bind(referredBy, email.toLowerCase(), userId).run();
      // Extend referrer's trial/plan by 30 days
      await env.DB.prepare(`UPDATE users SET plan_expires_at = CASE WHEN plan_expires_at IS NULL THEN datetime(trial_expires_at, '+30 days') ELSE datetime(plan_expires_at, '+30 days') END WHERE id = ?`)
        .bind(referredBy).run();
    }

    // Welcome email — Day 0
    const firstName = (name || email).split(' ')[0].split('@')[0];
    await sendEmail(env.POSTMARK_SERVER_TOKEN, email,
      `Welcome to MedMed.AI — your 3-day trial has started`,
      `<h2>You're in, ${firstName}.</h2><p>Your 3-day full trial is now active. Here's what to try first:</p><ul><li>Open the <a href="https://medmed.ai/chat">chat</a> and ask about any medication or symptom</li><li>Try the Interaction Checker from the + menu</li><li>Check the Pharmacy Finder</li></ul><p>Your trial ends on ${new Date(trialExpires).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}. <a href="https://medmed.ai/pricing">See plans</a> to continue access.</p>`,
      `Welcome to MedMed.AI. Your 3-day trial is active. Visit https://medmed.ai/chat to get started.`
    ).catch(() => {});

    const token = await createJWT({ sub: userId, email, tier: 'free', role: 'user', trialExpires }, env.JWT_SECRET);
    return json({ token, user: { id: userId, email, name: name || null, tier: 'free', trialExpires, referralCode: myReferralCode, memberSince: now } }, 201, origin);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return err('Email already registered', 409, origin);
    return err('Registration failed', 500, origin);
  }
}

// ─── /api/auth/signin ─────────────────────────────────────────────────────────

async function handleSignin(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { email, password } = body;
  if (!email || !password) return err('email and password required', 400, origin);
  try {
    const user = await env.DB.prepare(`SELECT * FROM users WHERE email = ?`).bind(email.toLowerCase()).first<any>();
    if (!user) return err('Invalid credentials', 401, origin);
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) return err('Invalid credentials', 401, origin);
    const token = await createJWT({ sub: user.id, email: user.email, tier: user.tier, role: user.role || 'user' }, env.JWT_SECRET);
    return json({ token, user: { id: user.id, email: user.email, name: user.name, tier: user.tier, memberSince: user.created_at } }, 200, origin);
  } catch {
    return err('Sign in failed', 500, origin);
  }
}

// ─── /api/auth/reset-request ──────────────────────────────────────────────────

async function handleResetRequest(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { email, type } = body; // type: 'user' | 'sponsor'
  if (!email) return err('email required', 400, origin);
  try {
    // Check if email exists (user or sponsor)
    const table = type === 'sponsor' ? 'sponsors' : 'users';
    const record = await env.DB.prepare(`SELECT id FROM ${table} WHERE email = ?`).bind(email.toLowerCase()).first<any>();
    // Always return success to not leak user existence
    if (record) {
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
      await env.DB.prepare(`INSERT INTO password_reset_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`)
        .bind(crypto.randomUUID(), record.id, token, expires).run();
      const resetLink = `https://medmed.ai/reset-password?token=${token}&type=${type || 'user'}`;
      await sendEmail(
        env.POSTMARK_SERVER_TOKEN, email,
        'Reset your MedMed.AI password',
        `<h2>Password Reset</h2><p>Click the link below to reset your password (expires in 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p>`,
        `Reset your MedMed.AI password: ${resetLink}`
      );
    }
    return json({ success: true }, 200, origin);
  } catch {
    return json({ success: true }, 200, origin); // Always succeed to not leak info
  }
}

// ─── /api/auth/reset-confirm ──────────────────────────────────────────────────

async function handleResetConfirm(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { token, password, type } = body;
  if (!token || !password) return err('token and password required', 400, origin);
  if (password.length < 8) return err('Password must be at least 8 characters', 400, origin);
  try {
    const resetRecord = await env.DB.prepare(
      `SELECT * FROM password_reset_tokens WHERE token = ? AND used = 0`
    ).bind(token).first<any>();
    if (!resetRecord) return err('Invalid or expired reset token', 400, origin);
    if (new Date(resetRecord.expires_at) < new Date()) return err('Reset token has expired', 400, origin);
    const newHash = await hashPassword(password);
    const table = type === 'sponsor' ? 'sponsors' : 'users';
    await env.DB.prepare(`UPDATE ${table} SET password_hash = ? WHERE id = ?`).bind(newHash, resetRecord.user_id).run();
    await env.DB.prepare(`UPDATE password_reset_tokens SET used = 1 WHERE id = ?`).bind(resetRecord.id).run();
    return json({ success: true }, 200, origin);
  } catch {
    return err('Password reset failed', 500, origin);
  }
}

// ─── /api/sponsor/register ────────────────────────────────────────────────────

async function handleSponsorRegister(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { email, password, name, companyName, package: pkg } = body;
  if (!email || !password || !companyName) return err('email, password, and companyName required', 400, origin);
  if (password.length < 8) return err('Password must be at least 8 characters', 400, origin);
  try {
    const passwordHash = await hashPassword(password);
    const sponsorId = crypto.randomUUID();
    const apiKey = `sk_${companyName.toLowerCase().replace(/\s+/g, '').substring(0, 12)}_${crypto.randomUUID().split('-')[0]}`;
    const now = new Date().toISOString();
    await env.DB.prepare(
      `INSERT INTO sponsors (id, email, name, company_name, package, password_hash, api_key, is_active, is_on_waitlist, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 1, ?)`
    ).bind(sponsorId, email.toLowerCase(), name || null, companyName, pkg || 'Standard', passwordHash, apiKey, now).run();
    const token = await createJWT({ sub: sponsorId, email, role: 'sponsor' }, env.JWT_SECRET);
    await sendEmail(env.POSTMARK_SERVER_TOKEN, email, 'Welcome to MedMed.AI Sponsor Program',
      `<h2>Welcome${name ? `, ${name}` : ''}!</h2><p>Your sponsor account for <strong>${companyName}</strong> has been created. Our team will review and activate your account shortly.</p><p><a href="https://medmed.ai/sponsor-login">Log in to your dashboard</a></p>`,
      `Welcome to MedMed.AI Sponsor Program. Account created for ${companyName}. Visit https://medmed.ai/sponsor-login`
    );
    return json({ token, sponsor: { id: sponsorId, email, name: name || null, companyName, package: pkg || 'Standard', apiKey, isActive: false, isOnWaitlist: true, createdAt: now } }, 201, origin);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return err('Email already registered', 409, origin);
    return err('Registration failed', 500, origin);
  }
}

// ─── /api/sponsor/signin ──────────────────────────────────────────────────────

async function handleSponsorSignin(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { email, password } = body;
  if (!email || !password) return err('email and password required', 400, origin);
  try {
    const sponsor = await env.DB.prepare(`SELECT * FROM sponsors WHERE email = ?`).bind(email.toLowerCase()).first<any>();
    if (!sponsor) return err('Invalid credentials', 401, origin);
    const valid = await verifyPassword(password, sponsor.password_hash);
    if (!valid) return err('Invalid credentials', 401, origin);
    const token = await createJWT({ sub: sponsor.id, email: sponsor.email, role: 'sponsor' }, env.JWT_SECRET);
    return json({ token, sponsor: { id: sponsor.id, email: sponsor.email, name: sponsor.name, companyName: sponsor.company_name, package: sponsor.package, apiKey: sponsor.api_key, isActive: !!sponsor.is_active, isOnWaitlist: !!sponsor.is_on_waitlist, startDate: sponsor.start_date, endDate: sponsor.end_date, createdAt: sponsor.created_at } }, 200, origin);
  } catch {
    return err('Sign in failed', 500, origin);
  }
}

// ─── /api/sponsor/list ────────────────────────────────────────────────────────

async function handleSponsorList(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  try {
    const { results } = await env.DB.prepare(
      `SELECT id, email, name, company_name, package, api_key, is_active, is_on_waitlist, start_date, end_date, created_at FROM sponsors ORDER BY created_at DESC`
    ).all<any>();
    return json({ success: true, sponsors: results.map((s: any) => ({ id: s.id, email: s.email, name: s.name, companyName: s.company_name, package: s.package, apiKey: s.api_key, isActive: !!s.is_active, isOnWaitlist: !!s.is_on_waitlist, startDate: s.start_date, endDate: s.end_date, createdAt: s.created_at })) }, 200, origin);
  } catch {
    return err('Failed to fetch sponsors', 500, origin);
  }
}

// ─── /api/admin/activate-sponsor ─────────────────────────────────────────────

async function handleActivateSponsor(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  // Verify admin JWT
  const token = getAuthToken(req);
  if (!token) return err('Unauthorized', 401, origin);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload || (payload.role !== 'admin' && payload.role !== 'owner')) return err('Admin access required', 403, origin);

  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { sponsorId, activate } = body;
  if (!sponsorId) return err('sponsorId required', 400, origin);

  try {
    const now = new Date().toISOString();
    if (activate) {
      const end = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 day default
      await env.DB.prepare(`UPDATE sponsors SET is_active = 1, is_on_waitlist = 0, start_date = ?, end_date = ? WHERE id = ?`)
        .bind(now, end, sponsorId).run();
      // Get sponsor email for notification
      const sponsor = await env.DB.prepare(`SELECT email, name, company_name FROM sponsors WHERE id = ?`).bind(sponsorId).first<any>();
      if (sponsor) {
        await sendEmail(env.POSTMARK_SERVER_TOKEN, sponsor.email, 'Your MedMed.AI Sponsor Account is Now Active!',
          `<h2>Your account is live!</h2><p>Congratulations ${sponsor.name || sponsor.company_name}! Your MedMed.AI sponsor account has been activated. Your ads are now showing on the platform.</p><p><a href="https://medmed.ai/sponsor-portal">View your dashboard</a></p>`,
          `Your MedMed.AI sponsor account for ${sponsor.company_name} is now active. Visit https://medmed.ai/sponsor-portal`
        );
      }
    } else {
      await env.DB.prepare(`UPDATE sponsors SET is_active = 0 WHERE id = ?`).bind(sponsorId).run();
    }
    return json({ success: true }, 200, origin);
  } catch {
    return err('Failed to update sponsor status', 500, origin);
  }
}

// ─── /api/admin/stats ──────────────────────────────────────────────────────────

async function handleAdminStats(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const token = getAuthToken(req);
  if (!token) return err('Unauthorized', 401, origin);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload || (payload.role !== 'admin' && payload.role !== 'owner')) return err('Admin access required', 403, origin);

  try {
    const [userCount, sponsorCount, activeSponsors, premiumUsers] = await Promise.all([
      env.DB.prepare(`SELECT COUNT(*) as count FROM users`).first<any>(),
      env.DB.prepare(`SELECT COUNT(*) as count FROM sponsors`).first<any>(),
      env.DB.prepare(`SELECT COUNT(*) as count FROM sponsors WHERE is_active = 1`).first<any>(),
      env.DB.prepare(`SELECT COUNT(*) as count FROM users WHERE tier != 'free'`).first<any>(),
    ]);
    return json({ success: true, stats: { totalUsers: userCount?.count || 0, totalSponsors: sponsorCount?.count || 0, activeSponsors: activeSponsors?.count || 0, paidUsers: premiumUsers?.count || 0 } }, 200, origin);
  } catch {
    return err('Failed to fetch stats', 500, origin);
  }
}

// ─── /api/admin/users ─────────────────────────────────────────────────────────

async function handleAdminUsers(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const token = getAuthToken(req);
  if (!token) return err('Unauthorized', 401, origin);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload || (payload.role !== 'admin' && payload.role !== 'owner')) return err('Admin access required', 403, origin);

  try {
    const { results } = await env.DB.prepare(
      `SELECT id, email, name, tier, role, created_at FROM users ORDER BY created_at DESC LIMIT 100`
    ).all<any>();
    return json({ success: true, users: results }, 200, origin);
  } catch {
    return err('Failed to fetch users', 500, origin);
  }
}

// ─── /api/admin/verify ────────────────────────────────────────────────────────
// Frontend calls this to verify the admin secret and get an admin JWT

async function handleAdminVerify(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { secret } = body;
  if (!secret || !env.ADMIN_SECRET || secret !== env.ADMIN_SECRET) return err('Invalid admin secret', 401, origin);
  const token = await createJWT({ role: 'admin', sub: 'admin' }, env.JWT_SECRET);
  return json({ success: true, token }, 200, origin);
}

// ─── /api/stripe/checkout ─────────────────────────────────────────────────────

async function handleStripeCheckout(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  if (!env.STRIPE_SECRET_KEY) return err('Stripe not configured', 503, origin);

  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { priceId, successUrl, cancelUrl, customerEmail, mode } = body;
  if (!priceId) return err('priceId required', 400, origin);

  try {
    const params = new URLSearchParams({
      'payment_method_types[]': 'card',
      'mode': mode || 'subscription',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'success_url': successUrl || 'https://medmed.ai/user-portal?session_id={CHECKOUT_SESSION_ID}',
      'cancel_url': cancelUrl || 'https://medmed.ai/subscription',
    });
    if (customerEmail) params.set('customer_email', customerEmail);

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const session: any = await res.json();
    if (!res.ok) return err(session.error?.message || 'Stripe error', 400, origin);
    return json({ success: true, url: session.url, sessionId: session.id }, 200, origin);
  } catch (e: any) {
    return err('Stripe checkout failed', 500, origin);
  }
}

// ─── /api/stripe/sponsor-checkout ─────────────────────────────────────────────

async function handleSponsorStripeCheckout(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  if (!env.STRIPE_SECRET_KEY) return err('Stripe not configured', 503, origin);

  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { amount, companyName, packageName, weeks, customerEmail, successUrl, cancelUrl } = body;
  if (!amount || !companyName) return err('amount and companyName required', 400, origin);

  try {
    const params = new URLSearchParams({
      'payment_method_types[]': 'card',
      'mode': 'payment',
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][unit_amount]': String(Math.round(amount * 100)),
      'line_items[0][price_data][product_data][name]': `${packageName} Ad Package (${weeks} week${weeks > 1 ? 's' : ''})`,
      'line_items[0][price_data][product_data][description]': `MedMed.AI sponsor advertising for ${companyName}`,
      'line_items[0][quantity]': '1',
      'success_url': successUrl || 'https://medmed.ai/sponsor-portal?session_id={CHECKOUT_SESSION_ID}',
      'cancel_url': cancelUrl || 'https://medmed.ai/advertiser-enrollment',
    });
    if (customerEmail) params.set('customer_email', customerEmail);

    const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const session: any = await res.json();
    if (!res.ok) return err(session.error?.message || 'Stripe error', 400, origin);
    return json({ success: true, url: session.url, sessionId: session.id }, 200, origin);
  } catch {
    return err('Stripe checkout failed', 500, origin);
  }
}

// ─── /api/stripe/webhook ──────────────────────────────────────────────────────

async function handleStripeWebhook(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const sig = req.headers.get('stripe-signature');
  if (!sig || !env.STRIPE_WEBHOOK_SECRET) return err('Webhook signature required', 400, origin);

  const body = await req.text();

  // Verify Stripe signature using HMAC-SHA256
  try {
    const parts = sig.split(',').map(p => p.trim());
    const tPart = parts.find(p => p.startsWith('t='));
    const v1Part = parts.find(p => p.startsWith('v1='));
    if (!tPart || !v1Part) return err('Invalid signature format', 400, origin);
    const t = tPart.slice(2);
    const v1 = v1Part.slice(3);
    const signedPayload = `${t}.${body}`;
    const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(env.STRIPE_WEBHOOK_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig2 = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
    const expected = Array.from(new Uint8Array(sig2)).map(b => b.toString(16).padStart(2, '0')).join('');
    if (expected !== v1) return err('Signature mismatch', 400, origin);
  } catch {
    return err('Webhook verification failed', 400, origin);
  }

  const event = JSON.parse(body);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const email = session.customer_email || session.customer_details?.email;
      const metadata = session.metadata || {};

      if (session.mode === 'subscription') {
        // User subscription payment
        const priceId = session.line_items?.data?.[0]?.price?.id;
        // Map price IDs to tiers - update these with your actual Stripe price IDs
        let tier = 'premium';
        if (priceId === env.STRIPE_BUSINESS_PRICE_ID) tier = 'business';
        if (email) {
          await env.DB.prepare(`UPDATE users SET tier = ? WHERE email = ?`).bind(tier, email.toLowerCase()).run();
        }
      } else if (session.mode === 'payment') {
        // Sponsor one-time payment — mark as waitlisted pending review
        if (email) {
          await env.DB.prepare(`UPDATE sponsors SET is_on_waitlist = 1 WHERE email = ?`).bind(email.toLowerCase()).run();
        }
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      if (sub.customer_email) {
        await env.DB.prepare(`UPDATE users SET tier = 'free' WHERE email = ?`).bind(sub.customer_email.toLowerCase()).run();
      }
    }
  } catch (e: any) {
    console.error('Webhook processing error:', e);
  }

  return json({ received: true }, 200, origin);
}

// ─── /api/user/tier ───────────────────────────────────────────────────────────

async function handleUpdateTier(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { userId, tier } = body;
  if (!userId || !tier) return err('userId and tier required', 400, origin);
  if (!['free', 'premium', 'business'].includes(tier)) return err('Invalid tier', 400, origin);
  try {
    await env.DB.prepare(`UPDATE users SET tier = ? WHERE id = ?`).bind(tier, userId).run();
    return json({ success: true }, 200, origin);
  } catch {
    return err('Failed to update tier', 500, origin);
  }
}

// ─── /api/email ───────────────────────────────────────────────────────────────

async function handleEmail(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { type, to, name, companyName, resetLink } = body;
  if (!to) return err('to required', 400, origin);
  try {
    if (type === 'welcome') {
      await sendEmail(env.POSTMARK_SERVER_TOKEN, to, 'Welcome to MedMed.AI',
        `<h2>Welcome${name ? `, ${name}` : ''}!</h2><p>Your MedMed.AI account is ready. Start searching medications, pharmacies, and specialists worldwide.</p><p><a href="https://medmed.ai">Go to MedMed.AI</a></p>`,
        `Welcome to MedMed.AI. Visit https://medmed.ai`
      );
    } else if (type === 'reset') {
      await sendEmail(env.POSTMARK_SERVER_TOKEN, to, 'Reset your MedMed.AI password',
        `<h2>Password Reset</h2><p>Click below to reset your password (expires in 1 hour):</p><p><a href="${resetLink}">${resetLink}</a></p>`,
        `Reset your password: ${resetLink}`
      );
    } else if (type === 'sponsor_welcome') {
      await sendEmail(env.POSTMARK_SERVER_TOKEN, to, 'Welcome to MedMed.AI Sponsor Program',
        `<h2>Welcome${name ? `, ${name}` : ''}!</h2><p>Your sponsor account for <strong>${companyName}</strong> has been created. Our team will review and activate it shortly.</p><p><a href="https://medmed.ai/sponsor-login">Log in</a></p>`,
        `Welcome to MedMed.AI Sponsor Program. Visit https://medmed.ai/sponsor-login`
      );
    }
    return json({ success: true }, 200, origin);
  } catch {
    return err('Email failed', 500, origin);
  }
}

// ─── Media Upload & Analysis (Pro only) ──────────────────────────────────────

async function handleMediaUpload(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const auth = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth) return err('Unauthorized', 401, origin);

  let userId: string, userTier: string;
  try {
    const payload = await verifyJWT(auth, env.JWT_SECRET);
    if (!payload) return err('Unauthorized', 401, origin);
    userId = payload.userId;
    userTier = payload.tier || 'free';
  } catch {
    return err('Unauthorized', 401, origin);
  }

  if (userTier !== 'premium' && userTier !== 'business') {
    return err('Pro membership required', 403, origin);
  }

  const contentType = req.headers.get('Content-Type') || 'application/octet-stream';
  const isVideo = contentType.startsWith('video/');
  const ext = isVideo ? 'webm' : 'jpg';
  const key = `captures/${userId}/${Date.now()}.${ext}`;

  const buffer = await req.arrayBuffer();
  await env.MEDIA.put(key, buffer, { httpMetadata: { contentType } });

  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO media_captures (id, user_id, type, r2_key) VALUES (?, ?, ?, ?)`
  ).bind(id, userId, isVideo ? 'video' : 'image', key).run();

  return json({ id, key }, 201, origin);
}

async function handleMediaAnalyze(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const auth = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!auth) return err('Unauthorized', 401, origin);

  let userId: string, userTier: string;
  try {
    const payload = await verifyJWT(auth, env.JWT_SECRET);
    userId = payload.userId;
    userTier = payload.tier || 'free';
  } catch {
    return err('Unauthorized', 401, origin);
  }

  if (userTier !== 'premium' && userTier !== 'business') {
    return err('Pro membership required', 403, origin);
  }

  const { id, type } = await req.json<{ id: string; type: 'image' | 'video' }>(); 

  // Fetch capture record
  const record = await env.DB.prepare(
    `SELECT r2_key, analysis FROM media_captures WHERE id = ? AND user_id = ?`
  ).bind(id, userId).first<{ r2_key: string; analysis: string | null }>();
  if (!record) return err('Not found', 404, origin);

  // Return cached analysis if available
  if (record.analysis) return json({ analysis: record.analysis }, 200, origin);

  // Fetch bytes from R2
  const obj = await env.MEDIA.get(record.r2_key);
  if (!obj) return err('Media not found in storage', 404, origin);
  const buffer = await obj.arrayBuffer();
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const mimeType = type === 'video' ? 'video/webm' : 'image/jpeg';

  const prompt = type === 'image'
    ? 'You are a medical visual assistant. Analyze this image and describe what you observe in detail, focusing on any visible health-related features such as skin conditions, eye symptoms, or physical characteristics. Provide helpful educational context. Always note this is not a medical diagnosis.'
    : 'You are a medical visual assistant. Watch this short video and describe what you observe about the person — their appearance, any visible symptoms or physical characteristics you notice. Provide helpful context. Always note this is not a medical diagnosis.';

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GOOGLE_GENAI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { inline_data: { mime_type: mimeType, data: b64 } },
            { text: prompt },
          ]
        }]
      }),
    }
  );

  const geminiJson = await geminiRes.json<any>();
  const analysis = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text
    ?? 'Analysis unavailable. Please try again.';

  // Cache the analysis
  await env.DB.prepare(`UPDATE media_captures SET analysis = ? WHERE id = ?`)
    .bind(analysis, id).run();

  return json({ analysis }, 200, origin);
}

// ─── /api/media/visual ─────────────────────────────────────────────────────────
// Accepts base64 image directly (no R2 upload) and calls Gemini vision inline.
// Used by the live camera/video capture modal.

async function handleMediaVisual(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  if (!env.GOOGLE_GENAI_API_KEY) return err('AI not configured', 503, origin);

  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { base64, mimeType, systemPrompt } = body;
  if (!base64) return err('base64 required', 400, origin);

  const mime = mimeType || 'image/jpeg';
  const prompt = systemPrompt || 'You are MedMed AI, a health information assistant. Analyze this image and describe what you observe, focusing on any health-relevant features. Provide educational context. Always note this is not a medical diagnosis and that the user should consult a healthcare professional for any medical concerns.';

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GOOGLE_GENAI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { inline_data: { mime_type: mime, data: base64 } },
              { text: prompt },
            ]
          }],
          generationConfig: { maxOutputTokens: 1024, temperature: 0.4 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('Gemini vision error:', errBody);
      return err('Gemini vision failed', 502, origin);
    }

    const geminiJson = await geminiRes.json<any>();
    const analysis = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text
      ?? 'Analysis unavailable. Please try again.';

    // Increment question counter
    await env.DB.prepare(`UPDATE global_stats SET value = value + 1 WHERE key = 'total_questions'`).run().catch(() => {});

    return json({ analysis }, 200, origin);
  } catch (e: any) {
    console.error('Visual analysis error:', e);
    return err('Visual analysis failed', 500, origin);
  }
}

// ─── /api/profile ─────────────────────────────────────────────────────────────

async function handleProfile(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const token = getAuthToken(req);
  if (!token) return err('Unauthorized', 401, origin);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return err('Unauthorized', 401, origin);
  const userId = payload.sub as string;

  if (req.method === 'GET') {
    const profile = await env.DB.prepare(`SELECT * FROM health_profiles WHERE user_id = ?`).bind(userId).first<any>();
    if (!profile) return json({ profile: null }, 200, origin);
    return json({ profile: { ...profile, conditions: JSON.parse(profile.conditions || '[]'), allergies: JSON.parse(profile.allergies || '[]'), current_meds: JSON.parse(profile.current_meds || '[]') } }, 200, origin);
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    let body: any;
    try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
    const { age, sex, weight_lbs, height_in, conditions, allergies, current_meds, notes } = body;
    const now = new Date().toISOString();
    await env.DB.prepare(`INSERT INTO health_profiles (user_id, age, sex, weight_lbs, height_in, conditions, allergies, current_meds, notes, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET age=excluded.age, sex=excluded.sex, weight_lbs=excluded.weight_lbs, height_in=excluded.height_in, conditions=excluded.conditions, allergies=excluded.allergies, current_meds=excluded.current_meds, notes=excluded.notes, updated_at=excluded.updated_at`)
      .bind(userId, age || null, sex || null, weight_lbs || null, height_in || null,
        JSON.stringify(conditions || []), JSON.stringify(allergies || []), JSON.stringify(current_meds || []),
        notes || null, now).run();
    return json({ success: true }, 200, origin);
  }

  return err('Method not allowed', 405, origin);
}

// ─── /api/medications ─────────────────────────────────────────────────────────

async function handleMedications(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const token = getAuthToken(req);
  if (!token) return err('Unauthorized', 401, origin);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return err('Unauthorized', 401, origin);
  const userId = payload.sub as string;

  if (req.method === 'GET') {
    const { results } = await env.DB.prepare(`SELECT * FROM medications WHERE user_id = ? AND active = 1 ORDER BY created_at DESC`).bind(userId).all<any>();
    return json({ medications: results }, 200, origin);
  }

  if (req.method === 'POST') {
    let body: any;
    try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
    const { name, dosage, frequency, time_of_day, notes } = body;
    if (!name) return err('name required', 400, origin);
    const id = crypto.randomUUID();
    await env.DB.prepare(`INSERT INTO medications (id, user_id, name, dosage, frequency, time_of_day, notes) VALUES (?, ?, ?, ?, ?, ?, ?)`)
      .bind(id, userId, name, dosage || null, frequency || null, time_of_day || null, notes || null).run();
    return json({ id, success: true }, 201, origin);
  }

  if (req.method === 'DELETE') {
    const url = new URL(req.url);
    const medId = url.searchParams.get('id');
    if (!medId) return err('id required', 400, origin);
    await env.DB.prepare(`UPDATE medications SET active = 0 WHERE id = ? AND user_id = ?`).bind(medId, userId).run();
    return json({ success: true }, 200, origin);
  }

  return err('Method not allowed', 405, origin);
}

// ─── /api/medications/log ─────────────────────────────────────────────────────

async function handleMedLog(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const token = getAuthToken(req);
  if (!token) return err('Unauthorized', 401, origin);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return err('Unauthorized', 401, origin);
  const userId = payload.sub as string;

  if (req.method === 'POST') {
    let body: any;
    try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
    const { medication_id } = body;
    if (!medication_id) return err('medication_id required', 400, origin);
    await env.DB.prepare(`INSERT INTO medication_logs (user_id, medication_id) VALUES (?, ?)`).bind(userId, medication_id).run();
    return json({ success: true }, 201, origin);
  }

  if (req.method === 'GET') {
    const { results } = await env.DB.prepare(`SELECT ml.*, m.name FROM medication_logs ml JOIN medications m ON ml.medication_id = m.id WHERE ml.user_id = ? ORDER BY ml.taken_at DESC LIMIT 60`).bind(userId).all<any>();
    return json({ logs: results }, 200, origin);
  }

  return err('Method not allowed', 405, origin);
}

// ─── /api/conversations ────────────────────────────────────────────────────────

async function handleConversations(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const token = getAuthToken(req);
  if (!token) return err('Unauthorized', 401, origin);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return err('Unauthorized', 401, origin);
  const userId = payload.sub as string;
  const url = new URL(req.url);
  const convId = url.searchParams.get('id');

  if (req.method === 'GET') {
    if (convId) {
      // Fetch messages for a conversation
      const conv = await env.DB.prepare(`SELECT * FROM conversations WHERE id = ? AND user_id = ?`).bind(convId, userId).first<any>();
      if (!conv) return err('Not found', 404, origin);
      const { results: messages } = await env.DB.prepare(`SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC`).bind(convId).all<any>();
      return json({ conversation: conv, messages }, 200, origin);
    }
    // List conversations
    const { results } = await env.DB.prepare(`SELECT * FROM conversations WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50`).bind(userId).all<any>();
    return json({ conversations: results }, 200, origin);
  }

  if (req.method === 'POST') {
    let body: any;
    try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
    const { title, messages: msgs } = body;
    if (!msgs || !Array.isArray(msgs)) return err('messages array required', 400, origin);
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    await env.DB.prepare(`INSERT INTO conversations (id, user_id, title, created_at, updated_at) VALUES (?, ?, ?, ?, ?)`)
      .bind(id, userId, title || msgs[0]?.content?.slice(0, 60) || 'Conversation', now, now).run();
    // Batch insert messages
    for (const m of msgs) {
      await env.DB.prepare(`INSERT INTO messages (conversation_id, user_id, role, content) VALUES (?, ?, ?, ?)`)
        .bind(id, userId, m.role, m.content).run();
    }
    return json({ id, success: true }, 201, origin);
  }

  return err('Method not allowed', 405, origin);
}

// ─── /api/journal ──────────────────────────────────────────────────────────────

async function handleJournal(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const token = getAuthToken(req);
  if (!token) return err('Unauthorized', 401, origin);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return err('Unauthorized', 401, origin);
  const userId = payload.sub as string;

  if (req.method === 'GET') {
    const { results } = await env.DB.prepare(`SELECT * FROM symptom_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 90`).bind(userId).all<any>();
    return json({ logs: results.map((r: any) => ({ ...r, symptoms: JSON.parse(r.symptoms || '[]') })) }, 200, origin);
  }

  if (req.method === 'POST') {
    let body: any;
    try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
    const { symptoms, severity, notes } = body;
    if (!symptoms || !Array.isArray(symptoms)) return err('symptoms array required', 400, origin);
    await env.DB.prepare(`INSERT INTO symptom_logs (user_id, symptoms, severity, notes) VALUES (?, ?, ?, ?)`)
      .bind(userId, JSON.stringify(symptoms), severity || null, notes || null).run();
    return json({ success: true }, 201, origin);
  }

  return err('Method not allowed', 405, origin);
}

// ─── /api/referral ─────────────────────────────────────────────────────────────

async function handleReferral(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const token = getAuthToken(req);
  if (!token) return err('Unauthorized', 401, origin);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return err('Unauthorized', 401, origin);
  const userId = payload.sub as string;

  if (req.method === 'GET') {
    const user = await env.DB.prepare(`SELECT referral_code, plan_expires_at FROM users WHERE id = ?`).bind(userId).first<any>();
    const { results: referrals } = await env.DB.prepare(`SELECT referred_email, converted, granted_at, created_at FROM referrals WHERE referrer_id = ? ORDER BY created_at DESC`).bind(userId).all<any>();
    return json({ referralCode: user?.referral_code, planExpiresAt: user?.plan_expires_at, referrals }, 200, origin);
  }

  return err('Method not allowed', 405, origin);
}

// ─── /api/stats ───────────────────────────────────────────────────────────────

async function handleStats(_req: Request, env: Env): Promise<Response> {
  const origin = _req.headers.get('Origin') || '*';
  try {
    const [questions, users] = await Promise.all([
      env.DB.prepare(`SELECT value FROM global_stats WHERE key = 'total_questions'`).first<any>(),
      env.DB.prepare(`SELECT value FROM global_stats WHERE key = 'total_users'`).first<any>(),
    ]);
    return json({ totalQuestions: questions?.value || 0, totalUsers: users?.value || 0 }, 200, origin);
  } catch {
    return json({ totalQuestions: 0, totalUsers: 0 }, 200, origin);
  }
}

// ─── /api/auth/profile (update name/password) ─────────────────────────────────

async function handleAuthProfile(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const token = getAuthToken(req);
  if (!token) return err('Unauthorized', 401, origin);
  const payload = await verifyJWT(token, env.JWT_SECRET);
  if (!payload) return err('Unauthorized', 401, origin);
  const userId = payload.sub as string;

  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const { name, currentPassword, newPassword } = body;

  if (name) {
    await env.DB.prepare(`UPDATE users SET name = ? WHERE id = ?`).bind(name, userId).run();
  }

  if (currentPassword && newPassword) {
    if (newPassword.length < 8) return err('Password must be at least 8 characters', 400, origin);
    const user = await env.DB.prepare(`SELECT password_hash FROM users WHERE id = ?`).bind(userId).first<any>();
    if (!user) return err('User not found', 404, origin);
    const valid = await verifyPassword(currentPassword, user.password_hash);
    if (!valid) return err('Current password is incorrect', 401, origin);
    const newHash = await hashPassword(newPassword);
    await env.DB.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).bind(newHash, userId).run();
  }

  return json({ success: true }, 200, origin);
}

// ─── Magic Link Auth ─────────────────────────────────────────────────────────

async function handleMagicLink(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: { email?: string };
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }
  const email = (body.email || '').trim().toLowerCase();
  if (!email) return err('Email required', 400, origin);

  // Check user exists
  const user = await env.DB.prepare(`SELECT id, name FROM users WHERE email = ?`).bind(email).first<{ id: string; name: string }>();
  if (!user) return err('No account found for that email. Please sign up first.', 404, origin);

  // Generate token (32-byte hex, 15 min TTY)
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 15; // 15 minutes

  await env.DB.prepare(
    `INSERT INTO magic_links (token, user_id, expires_at, used) VALUES (?, ?, ?, 0)
     ON CONFLICT(user_id) DO UPDATE SET token = excluded.token, expires_at = excluded.expires_at, used = 0`
  ).bind(token, user.id, expiresAt).run();

  const link = `https://medmed.pages.dev/auth/verify?token=${token}`;
  const firstName = (user.name || '').split(' ')[0] || 'there';

  // Send via Postmark
  if (env.POSTMARK_SERVER_TOKEN) {
    await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': env.POSTMARK_SERVER_TOKEN,
      },
      body: JSON.stringify({
        From: 'noreply@medmed.ai',
        To: email,
        Subject: 'Your medmed.ai sign-in link',
        HtmlBody: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#faf8f4">
  <p style="font-size:17px;font-weight:700;color:#111">medmed.ai</p>
  <h2 style="font-size:22px;font-weight:700;color:#111;margin:24px 0 8px">Sign in, ${firstName}</h2>
  <p style="color:#555;font-size:15px;line-height:1.6">Click the button below to sign in. This link expires in 15 minutes and can only be used once.</p>
  <a href="${link}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#7c3aed;color:#fff;font-weight:700;font-size:15px;border-radius:12px;text-decoration:none">Sign in to medmed.ai</a>
  <p style="color:#999;font-size:12px;margin-top:24px">If you didn't request this, ignore this email. Your account is safe.</p>
  <p style="color:#ccc;font-size:11px;margin-top:8px">© ${new Date().getFullYear()} medmed.ai</p>
</div>`,
        TextBody: `Sign in to medmed.ai\n\n${link}\n\nThis link expires in 15 minutes.`,
        MessageStream: 'outbound',
      }),
    });
  }

  return json({ success: true }, 200, origin);
}

async function handleVerifyMagicLink(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  const url = new URL(req.url);
  const token = url.searchParams.get('token') || '';
  if (!token) return err('Token required', 400, origin);

  const row = await env.DB.prepare(
    `SELECT ml.user_id, ml.expires_at, ml.used, u.email, u.name, u.plan
     FROM magic_links ml JOIN users u ON u.id = ml.user_id
     WHERE ml.token = ?`
  ).bind(token).first<{ user_id: string; expires_at: number; used: number; email: string; name: string; plan: string }>();

  if (!row) return err('Invalid or expired link.', 401, origin);
  if (row.used) return err('This link has already been used. Request a new one.', 401, origin);
  if (row.expires_at < Math.floor(Date.now() / 1000)) return err('This link has expired. Request a new one.', 401, origin);

  // Mark as used
  await env.DB.prepare(`UPDATE magic_links SET used = 1 WHERE token = ?`).bind(token).run();

  // Issue JWT
  const jwt = await createJWT({ userId: row.user_id, email: row.email, plan: row.plan || 'trial' }, env.JWT_SECRET);
  return json({ success: true, token: jwt, user: { id: row.user_id, email: row.email, name: row.name, plan: row.plan || 'trial' } }, 200, origin);
}

async function handleRegisterWithTrial(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: { firstName?: string; email?: string; paymentMethodId?: string };
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }

  const { firstName, email, paymentMethodId } = body;
  if (!firstName || !email) return err('First name and email are required.', 400, origin);
  if (!paymentMethodId || paymentMethodId === 'pm_placeholder') {
    // Payment not yet integrated via Stripe.js — still create account in trial state
    // In production: paymentMethodId comes from Stripe.js confirmCardSetup
  }

  const emailLower = email.trim().toLowerCase();
  const existing = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`).bind(emailLower).first();
  if (existing) return err('An account with that email already exists. Sign in instead.', 409, origin);

  const userId = crypto.randomUUID();
  const trialEndsAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3; // 3 days

  await env.DB.prepare(
    `INSERT INTO users (id, email, name, plan, trial_ends_at, created_at) VALUES (?, ?, ?, 'trial', ?, unixepoch())`
  ).bind(userId, emailLower, firstName.trim(), trialEndsAt).run();

  // Send magic link / welcome email via Postmark
  const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
  const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour for welcome link
  await env.DB.prepare(
    `INSERT OR REPLACE INTO magic_links (token, user_id, expires_at, used) VALUES (?, ?, ?, 0)`
  ).bind(token, userId, expiresAt).run();

  const welcomeLink = `https://medmed.pages.dev/auth/verify?token=${token}`;
  if (env.POSTMARK_SERVER_TOKEN) {
    await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', 'X-Postmark-Server-Token': env.POSTMARK_SERVER_TOKEN },
      body: JSON.stringify({
        From: 'noreply@medmed.ai',
        To: emailLower,
        Subject: 'Welcome to medmed.ai — your trial has started',
        HtmlBody: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#faf8f4">
  <p style="font-size:17px;font-weight:700;color:#111">medmed.ai</p>
  <h2 style="font-size:22px;font-weight:700;color:#111;margin:24px 0 8px">Welcome, ${firstName}!</h2>
  <p style="color:#555;font-size:15px;line-height:1.6">Your 3-day trial has started. Click below to access your account.</p>
  <a href="${welcomeLink}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:#7c3aed;color:#fff;font-weight:700;font-size:15px;border-radius:12px;text-decoration:none">Access medmed.ai</a>
  <p style="color:#999;font-size:12px;margin-top:24px">This link expires in 1 hour. If you have questions, just reply to this email.</p>
</div>`,
        TextBody: `Welcome to medmed.ai!\n\n${welcomeLink}`,
        MessageStream: 'outbound',
      }),
    }).catch(() => {});
  }

  // Issue immediate JWT so user can go straight to onboarding
  const jwt = await createJWT({ userId, email: emailLower, plan: 'trial' }, env.JWT_SECRET);
  return json({ success: true, token: jwt, user: { id: userId, email: emailLower, name: firstName, plan: 'trial' } }, 201, origin);
}

// ─── Main Router ──────────────────────────────────────────────────────────────

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '*';
    const path = url.pathname;

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) });

    try {
      // AI & Search
      if (path === '/api/ai'                     && req.method === 'POST') return handleAI(req, env);
      if (path === '/api/search'                 && req.method === 'POST') return handleSearch(req, env);

      // Magic Link Auth (new — replaces password login)
      if (path === '/api/auth/magic-link' && req.method === 'POST') return handleMagicLink(req, env);
      if (path === '/api/auth/verify'     && req.method === 'GET')  return handleVerifyMagicLink(req, env);
      if (path === '/api/auth/register'   && req.method === 'POST') return handleRegisterWithTrial(req, env);

      // Legacy password auth (kept for backwards compat)
      if (path === '/api/auth/signup'            && req.method === 'POST') return handleSignup(req, env);
      if (path === '/api/auth/signin'            && req.method === 'POST') return handleSignin(req, env);
      if (path === '/api/auth/reset-request'     && req.method === 'POST') return handleResetRequest(req, env);
      if (path === '/api/auth/reset-confirm'     && req.method === 'POST') return handleResetConfirm(req, env);

      // Sponsor Auth
      if (path === '/api/sponsor/register'       && req.method === 'POST') return handleSponsorRegister(req, env);
      if (path === '/api/sponsor/signin'         && req.method === 'POST') return handleSponsorSignin(req, env);
      if (path === '/api/sponsor/list'           && req.method === 'GET')  return handleSponsorList(req, env);

      // Admin
      if (path === '/api/admin/verify'           && req.method === 'POST') return handleAdminVerify(req, env);
      if (path === '/api/admin/stats'            && req.method === 'GET')  return handleAdminStats(req, env);
      if (path === '/api/admin/users'            && req.method === 'GET')  return handleAdminUsers(req, env);
      if (path === '/api/admin/activate-sponsor' && req.method === 'POST') return handleActivateSponsor(req, env);
      if (path === '/api/admin/config'           && (req.method === 'GET' || req.method === 'POST')) return handleAdminConfig(req, env);

      // Stripe
      if (path === '/api/stripe/checkout'         && req.method === 'POST') return handleStripeCheckout(req, env);
      if (path === '/api/stripe/sponsor-checkout' && req.method === 'POST') return handleSponsorStripeCheckout(req, env);
      if (path === '/api/stripe/webhook'          && req.method === 'POST') return handleStripeWebhook(req, env);

      // Misc
      if (path === '/api/user/tier'              && req.method === 'POST') return handleUpdateTier(req, env);
      if (path === '/api/user/apikey'            && (req.method === 'GET' || req.method === 'POST' || req.method === 'DELETE')) return handleUserApiKey(req, env);
      if (path === '/api/email'                  && req.method === 'POST') return handleEmail(req, env);
      if (path === '/api/media/upload'           && req.method === 'POST') return handleMediaUpload(req, env);
      if (path === '/api/media/analyze'          && req.method === 'POST') return handleMediaAnalyze(req, env);
      if (path === '/api/media/visual'           && req.method === 'POST') return handleMediaVisual(req, env);
      if (path === '/health') return json({ status: 'ok', env: env.WORKER_ENV, version: 'v3' });

      // Health Profile & Memory
      if (path === '/api/profile'          && (req.method === 'GET' || req.method === 'POST' || req.method === 'PUT')) return handleProfile(req, env);
      if (path === '/api/auth/profile'     && req.method === 'POST') return handleAuthProfile(req, env);

      // Medication Tracker
      if (path === '/api/medications'      && (req.method === 'GET' || req.method === 'POST' || req.method === 'DELETE')) return handleMedications(req, env);
      if (path === '/api/medications/log'  && (req.method === 'GET' || req.method === 'POST')) return handleMedLog(req, env);

      // Conversation History
      if (path === '/api/conversations'    && (req.method === 'GET' || req.method === 'POST')) return handleConversations(req, env);

      // Symptom Journal
      if (path === '/api/journal'          && (req.method === 'GET' || req.method === 'POST')) return handleJournal(req, env);

      // Referrals
      if (path === '/api/referral'         && req.method === 'GET') return handleReferral(req, env);

      // Global stats (live counter)
      if (path === '/api/stats'            && req.method === 'GET') return handleStats(req, env);

      return err('Not found', 404, origin);
    } catch (e: any) {
      console.error('Worker error:', e);
      return err('Internal server error', 500, origin);
    }
  }
};
