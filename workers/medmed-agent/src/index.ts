/**
 * MedMed.AI — Cloudflare Worker Agentic Brain
 * 
 * All Gemini calls are server-side. The frontend's existing AIService.ts and
 * MedicalSearchContext.tsx call this Worker. Zero frontend UI changes.
 * 
 * Secrets (set via `wrangler secret put`):
 *   GOOGLE_GENAI_API_KEY
 *   JWT_SECRET
 */

export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  GOOGLE_GENAI_API_KEY: string;
  JWT_SECRET: string;
  POSTMARK_SERVER_TOKEN: string;
  WORKER_ENV: string;
}

// ─── CORS ────────────────────────────────────────────────────────────────────

function corsHeaders(origin: string = '*'): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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

// ─── Gemini Client ─────────────────────────────────────────────────────────

const GEMINI_MODEL = 'gemini-2.0-flash';

async function callGemini(
  apiKey: string,
  systemPrompt: string,
  userMessage: string,
  history: Array<{ role: string; parts: [{ text: string }] }> = []
): Promise<string> {
  const contents = [
    ...history,
    { role: 'user', parts: [{ text: userMessage }] }
  ];

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 2048,
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errorText}`);
  }

  const data: any = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ─── Medical Agent System Prompt ─────────────────────────────────────────────

const MEDICAL_SYSTEM_PROMPT = `You are MedMed AI, an intelligent healthcare assistant platform.
You help users with:
- Medication information (ingredients, dosage, side effects, pricing)
- Pharmacy and Med Spa discovery worldwide
- Symptom analysis and when to seek care
- Drug interaction checks
- Specialist referrals
- General health education

IMPORTANT RULES:
1. Always include appropriate medical disclaimers
2. Never diagnose — provide educational information only
3. Always recommend consulting a healthcare professional for serious concerns
4. Be concise, accurate, and empathetic
5. For location-based searches, provide structured results

When returning search results, format them as a JSON block within your response like this:
\`\`\`json
{
  "results": [
    {
      "name": "...",
      "details": "...",
      "price": "...",
      "type": "Medication|Pharmacy|Med Spa|Specialist",
      "source": "...",
      "phone": "...",
      "address": "..."
    }
  ],
  "answer": "Your conversational response here",
  "disclaimer": "Standard medical disclaimer if applicable"
}
\`\`\`

If no structured results are needed, just respond conversationally.`;

// ─── Route: /api/ai — Primary AI endpoint ─────────────────────────────────

async function handleAI(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';

  let body: any;
  try {
    body = await req.json();
  } catch {
    return err('Invalid JSON body', 400, origin);
  }

  const { query, systemPrompt, history, searchType } = body;

  if (!query) return err('query is required', 400, origin);
  if (!env.GOOGLE_GENAI_API_KEY) return err('AI service not configured', 503, origin);

  try {
    // Build context-aware system prompt
    let effectiveSystemPrompt = systemPrompt || MEDICAL_SYSTEM_PROMPT;

    // If this is a search-type request, add search instructions
    if (searchType === 'location') {
      effectiveSystemPrompt += `\n\nThis is a location-based search. Return structured JSON results with nearby pharmacies, med spas, or healthcare providers. Include realistic addresses and phone numbers.`;
    }

    const rawResponse = await callGemini(
      env.GOOGLE_GENAI_API_KEY,
      effectiveSystemPrompt,
      query,
      history || []
    );

    // Try to parse structured JSON from the response
    const jsonMatch = rawResponse.match(/```json\n?([\s\S]*?)\n?```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return json({
          success: true,
          content: parsed.answer || rawResponse.replace(/```json[\s\S]*?```/g, '').trim(),
          results: parsed.results || [],
          disclaimer: parsed.disclaimer || null,
          provider: 'gemini',
          raw: rawResponse
        }, 200, origin);
      } catch {
        // Fall through to plain text response
      }
    }

    return json({
      success: true,
      content: rawResponse,
      results: [],
      disclaimer: null,
      provider: 'gemini',
    }, 200, origin);

  } catch (e: any) {
    console.error('Gemini error:', e);
    return json({
      success: false,
      content: 'AI service temporarily unavailable. Please try again.',
      provider: 'gemini',
    }, 200, origin); // 200 so frontend doesn't break — success:false signals the error
  }
}

// ─── Route: /api/search — Medication/pharmacy search ──────────────────────

async function handleSearch(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';

  let body: any;
  try {
    body = await req.json();
  } catch {
    return err('Invalid JSON body', 400, origin);
  }

  const { query, searchType, language } = body;
  if (!query) return err('query is required', 400, origin);
  if (!env.GOOGLE_GENAI_API_KEY) return err('AI service not configured', 503, origin);

  const searchPrompt = `You are MedMed AI search engine. The user searched: "${query}"
Search type hint: ${searchType || 'general'}
Language preference: ${language || 'en'}

Return a JSON array of search results. Each result must have:
- name: string
- details: string (concise description, 1-2 sentences)
- price: string (estimated price or "Contact for pricing")
- type: one of "Tablet"|"Capsule"|"Injection"|"Pharmacy"|"Med Spa"|"Specialist"|"Cream"|"Other"
- source: string (e.g., "FDA Database", "WHO", "Medical Database")
- phone: string or null
- address: string or null

Return ONLY a JSON array. No other text. Return 6-10 relevant results.`;

  try {
    const rawResponse = await callGemini(
      env.GOOGLE_GENAI_API_KEY,
      searchPrompt,
      query
    );

    // Extract JSON array from response
    let results = [];
    const arrayMatch = rawResponse.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      try {
        results = JSON.parse(arrayMatch[0]);
      } catch {
        results = [];
      }
    }

    return json({ success: true, results }, 200, origin);
  } catch (e: any) {
    console.error('Search error:', e);
    return json({ success: false, results: [] }, 200, origin);
  }
}

// ─── Route: /api/auth/signup ─────────────────────────────────────────────────

async function handleSignup(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }

  const { email, password, name } = body;
  if (!email || !password) return err('email and password required', 400, origin);
  if (password.length < 8) return err('Password must be at least 8 characters', 400, origin);

  try {
    // Hash password using Web Crypto
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const hashBuffer = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    const passwordHash = `${saltHex}:${hashHex}`;

    const userId = crypto.randomUUID();
    await env.DB.prepare(
      `INSERT INTO users (id, email, name, password_hash, tier, created_at) VALUES (?, ?, ?, ?, 'free', ?)`
    ).bind(userId, email.toLowerCase(), name || null, passwordHash, new Date().toISOString()).run();

    const token = await createJWT({ sub: userId, email, tier: 'free' }, env.JWT_SECRET);

    return json({
      token,
      user: { id: userId, email, name: name || null, tier: 'free', memberSince: new Date().toISOString() }
    }, 201, origin);
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) return err('Email already registered', 409, origin);
    console.error('Signup error:', e);
    return err('Registration failed', 500, origin);
  }
}

// ─── Route: /api/auth/signin ─────────────────────────────────────────────────

async function handleSignin(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }

  const { email, password } = body;
  if (!email || !password) return err('email and password required', 400, origin);

  try {
    const user = await env.DB.prepare(`SELECT * FROM users WHERE email = ?`)
      .bind(email.toLowerCase()).first<any>();

    if (!user) return err('Invalid credentials', 401, origin);

    const [saltHex, storedHash] = user.password_hash.split(':');
    const encoder = new TextEncoder();
    const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map((h: string) => parseInt(h, 16)));
    const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
    const hashBuffer = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    if (hashHex !== storedHash) return err('Invalid credentials', 401, origin);

    const token = await createJWT({ sub: user.id, email: user.email, tier: user.tier }, env.JWT_SECRET);
    return json({
      token,
      user: { id: user.id, email: user.email, name: user.name, tier: user.tier, memberSince: user.created_at }
    }, 200, origin);
  } catch (e: any) {
    console.error('Signin error:', e);
    return err('Sign in failed', 500, origin);
  }
}

// ─── Postmark Email ─────────────────────────────────────────────────

async function sendEmail(
  token: string,
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string
): Promise<void> {
  if (!token) return; // Graceful no-op if secret not yet set
  await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': token,
    },
    body: JSON.stringify({
      From: 'noreply@medmed.ai',
      To: to,
      Subject: subject,
      HtmlBody: htmlBody,
      TextBody: textBody,
      MessageStream: 'outbound',
    }),
  });
}

async function handleEmail(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get('Origin') || '*';
  let body: any;
  try { body = await req.json(); } catch { return err('Invalid JSON', 400, origin); }

  const { type, to, name } = body;
  if (!to) return err('to is required', 400, origin);

  try {
    if (type === 'welcome') {
      await sendEmail(
        env.POSTMARK_SERVER_TOKEN,
        to,
        'Welcome to MedMed.AI',
        `<h1>Welcome${name ? `, ${name}` : ''}!</h1><p>Your MedMed.AI account is ready. Start searching medications, pharmacies, and specialists worldwide.</p><p><a href="https://medmed.ai">Go to MedMed.AI</a></p>`,
        `Welcome${name ? `, ${name}` : ''}! Your MedMed.AI account is ready. Visit https://medmed.ai to get started.`
      );
    } else if (type === 'reset') {
      const { resetLink } = body;
      await sendEmail(
        env.POSTMARK_SERVER_TOKEN,
        to,
        'Reset your MedMed.AI password',
        `<h1>Password Reset</h1><p>Click the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>This link expires in 1 hour.</p>`,
        `Reset your MedMed.AI password: ${resetLink}`
      );
    }
    return json({ success: true }, 200, origin);
  } catch (e: any) {
    console.error('Postmark error:', e);
    return err('Email send failed', 500, origin);
  }
}

// ─── JWT ─────────────────────────────────────────────────────────────────────

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

// ─── D1 Schema (run once via: wrangler d1 execute medmed-db --file=schema.sql) ─

// ─── Main Handler ─────────────────────────────────────────────────────────────

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin') || '*';
    const path = url.pathname;

    // Preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    try {
      if (path === '/api/ai' && req.method === 'POST')           return handleAI(req, env);
      if (path === '/api/search' && req.method === 'POST')       return handleSearch(req, env);
      if (path === '/api/auth/signup' && req.method === 'POST')  return handleSignup(req, env);
      if (path === '/api/auth/signin' && req.method === 'POST')  return handleSignin(req, env);
      if (path === '/api/email' && req.method === 'POST')        return handleEmail(req, env);
      if (path === '/health')                                    return json({ status: 'ok', env: env.WORKER_ENV });

      return err('Not found', 404, origin);
    } catch (e: any) {
      console.error('Worker error:', e);
      return err('Internal server error', 500, origin);
    }
  }
};
