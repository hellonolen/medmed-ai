# CLAUDE.md — medmed.ai Platform Reference

> **Brand rule**: The platform is always written as **medmed.ai** (all lowercase) in all copy, UI labels, and code comments. Never "MedMed.AI", "Medmed", or "AI" as a standalone word on the platform.

---

## Project Overview

**medmed.ai** is a conversational health information platform built on Cloudflare Pages (frontend) + Cloudflare Workers (backend). It is an agentic AI system powered by Google Gemini as the foundation, with optional routing to Claude, GPT-4o, GLM-4, and Perplexity via a Conductor AI.

- **Frontend**: Vite + React + TypeScript + TailwindCSS
- **Backend**: Cloudflare Workers (`workers/medmed-agent/src/index.ts`)
- **Database**: Cloudflare D1 (`schema.sql`)
- **Auth**: JWT tokens (`medmed_token` in localStorage)
- **Payments**: Stripe
- **Email**: Postmark
- **Worker URL**: `https://medmed-agent.hellonolen.workers.dev`

---

## Architecture

### AI / Conductor Pattern
- **Gemini is the foundation** — all voice, video, image, and camera input routes through Gemini
- **Conductor AI** (`conductorRoute` in worker) — Gemini Flash meta-agent routes text queries to the best model:
  - `gemini` → vision, image, pharmacy, quick facts (always the fallback)
  - `claude-3-7-sonnet` → complex reasoning, differential diagnosis
  - `gpt-4o` → patient education, drug explanations
  - `glm-4-flash` → multilingual, traditional medicine
  - `perplexity-sonar-pro` → research, clinical guidelines, latest studies
- **BYOA keys** (Enterprise/Max/Business only): JSON format `{"gemini":"…","anthropic":"…","openai":"…","glm":"…","perplexity":"…"}`

### Worker Environment Variables
```
GOOGLE_GENAI_API_KEY       # Required — Gemini (foundation)
ANTHROPIC_API_KEY          # Optional — Claude augmentation
OPENAI_API_KEY             # Optional — GPT-4o augmentation
GLM_API_KEY                # Optional — GLM-4 augmentation
PERPLEXITY_API_KEY         # Optional — Perplexity augmentation
JWT_SECRET
POSTMARK_SERVER_TOKEN
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
ADMIN_SECRET
WORKER_ENV
```

---

## Key Files

| File | Purpose |
|---|---|
| `src/pages/Index.tsx` | Main chat UI (sidebar, modes, voice, camera) |
| `src/pages/Landing.tsx` | Public landing page |
| `src/pages/BusinessCenter.tsx` | Business Center page with sticky sidebar nav |
| `src/pages/About.tsx` | About medmed.ai |
| `src/pages/HowItWorks.tsx` | How it works page |
| `src/pages/FAQ.tsx` | FAQ page |
| `src/components/GlobalHeader.tsx` | **Global sticky header** — logo left, nav right |
| `src/components/GlobalFooter.tsx` | **Global footer** — copyright + Policy Center · Support · Contact |
| `src/components/SiteNav.tsx` | Re-exports `GlobalHeader` for backwards compat |
| `src/components/MediaCaptureModal.tsx` | Camera (photo→Gemini) + Video modal |
| `src/contexts/AgentContext.tsx` | Agentic core — thinking state, proactive messages |
| `src/hooks/useVoice.ts` | Web Speech API mic input + TTS output |
| `src/lib/eventBus.ts` | Typed pub/sub event bus |
| `workers/medmed-agent/src/index.ts` | Cloudflare Worker — all API routes |
| `workers/medmed-agent/schema.sql` | D1 database schema |

---

## Sidebar Structure (Index.tsx)

Left sidebar sections (all collapsible with chevron toggle):
1. **Chats** — chat history (Pro only)
2. **Projects** — user-created folders, persisted in `localStorage` (`mm_projects`)
3. **Library** (formerly Artifacts) — saved responses + user-created folders (`mm_library_folders`)
4. **Business** — Business Center, Sponsor, Advertiser, Affiliates, Policy Center

Plus icons (+ button area) for tools: Symptom Checker, Interaction Checker, Pharmacy Finder.

---

## Chat Footer (Index.tsx)

Fixed to absolute bottom-right of main content area:
```
Business Center · Policy Center · Support · Contact
```
- **Business Center** → `/business`
- **Policy Center** → `/policy`
- **Support** → `/chat` (support IS the AI chat)
- **Contact** → `/contact`

---

## Business Center (`/business`)

Dedicated page (`src/pages/BusinessCenter.tsx`) with a **sticky left sidebar** (stays fixed while content scrolls). Nav items:
- Sponsor → `/sponsor-portal`
- Advertiser → `/advertiser-enrollment`
- Affiliates → `/referral`
- Policy Center → `/policy`

---

## Authentication (Current State — Planned Migration)

**Current**: JWT-based email/password auth via Cloudflare Worker.

**Planned changes** (not yet implemented):
1. **Credit card required for all signups** — everyone enters CC at signup; 3-day trial starts; cancel within 3 days = no charge. No free access without CC.
2. **Magic link login** — replace password with email magic links (token stored in D1, sent via Postmark, single-use, 15-min expiry).
3. **Whop.com fallback** — if user loses email access, support can verify identity via Whop purchase record and update email.

Signup fields: First Name + Email + CC (Stripe Elements).

---

## Global UI Rules

- **Header**: `GlobalHeader` — sticky, `medmed.ai` logo left, nav links right-justified (`ml-auto`), CTAs far right
- **Footer**: `GlobalFooter` — copyright left, Policy Center · Support · Contact right
- **No "AI" standalone word** — always say "medmed.ai"
- **No "Contact Support"** — support goes to the chat (`/chat`); contact form is separate (`/contact`)
- **Sidebar sticky** — all pages with left sidebars use `sticky top-0 h-screen self-start`; main content uses `overflow-y-auto`
- **Buttons not side-by-side** — stacked vertically on CTAs/landing sections

---

## Deployment

```bash
# Frontend
npm run build
npx wrangler pages deploy dist --project-name=medmed

# Worker
cd workers/medmed-agent
npx wrangler deploy
```

Production: `https://medmed.pages.dev` (+ custom domain)
Worker: `https://medmed-agent.hellonolen.workers.dev`

---

## Plans & Pricing

- **Free** (legacy — being replaced with CC-required trial model)
- **Pro** — unlimited questions, health profile memory, all tools
- **Max** — BYOA keys, priority support
- **Enterprise** — BYOA keys, custom integrations
- **Business** — Sponsor/Advertiser/Affiliate accounts

---

## Notes for Future Work

- Magic link auth + CC-at-signup is the next major auth refactor
- Whop.com membership verification for identity recovery
- Worker lint errors: `any` types in `workers/medmed-agent/src/index.ts` — non-critical
- `useCallback` missing dependency `mode` in `Index.tsx` line ~435 — non-critical warning
