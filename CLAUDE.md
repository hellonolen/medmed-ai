# CLAUDE.md — medmed.ai Platform Reference

> **Brand rule**: The platform is always written as **medmed.ai** (all lowercase) in all copy, UI labels, and code comments. Never "MedMed.AI", "Medmed", or "AI" as a standalone word on the platform.

---

## Project Overview

**medmed.ai** is a conversational health research platform built on Cloudflare Pages (frontend) + Cloudflare Workers (backend). It provides research-assisted information powered by Google Gemini as the foundation, with optional routing to Claude, GPT-4o, GLM-4, and Perplexity via a Conductor.

- **Frontend**: Vite + React + TypeScript + TailwindCSS
- **Backend**: Cloudflare Workers (`workers/medmed-agent/src/index.ts`)
- **Database**: Cloudflare D1 (`schema.sql`)
- **Auth**: JWT tokens (`medmed_token` in localStorage)
- **Payments**: Stripe
- **Email**: Postmark
- **Worker URL**: `https://medmed-agent.hellonolen.workers.dev`

---

## Architecture

### Research / Conductor Pattern
- **Gemini is the foundation** — all voice, video, image, and camera input routes through Gemini
- **Conductor** (`conductorRoute` in worker) — Gemini Flash meta-agent routes text queries to the best model for research:
  - `gemini` → vision, image, pharmacy, quick facts (always the fallback)
  - `claude-3-7-sonnet` → complex reasoning, data analysis
  - `gpt-4o` → patient education materials, drug interaction data
  - `glm-4-flash` → multilingual research, traditional information
  - `perplexity-sonar-pro` → research, health guidelines, latest studies
- **BYOA keys** (Enterprise/Max/Business only): JSON format `{"gemini":"…","anthropic":"…","openai":"…","glm":"…","perplexity":"…"}`

---

## Key Files

| File | Purpose |
|---|---|
| `v2/src/pages/Dashboard.tsx` | Main research UI (sidebar, modes, voice, camera) |
| `v2/src/pages/Landing.tsx` | Public landing page |
| `v2/src/pages/BusinessCenter.tsx` | Business Center page with sticky sidebar nav |
| `v2/src/pages/About.tsx` | About medmed.ai |
| `v2/src/pages/HowItWorks.tsx` | How it works page |
| `v2/src/pages/Legal.tsx` | Legal center (Privacy, Terms, Policy, Support) |
| `v2/src/components/Nav.tsx` | Global header/navigation |
| `v2/src/components/Footer.tsx` | Global footer |
| `v2/src/components/Sidebar.tsx` | Tool navigation rail |
| `v2/src/contexts/AuthContext.tsx` | Auth state management |
| `v2/src/contexts/SubscriptionContext.tsx` | Plan state management |
| `workers/medmed-agent/src/index.ts` | Cloudflare Worker — all API routes |
| `workers/medmed-agent/schema.sql` | D1 database schema |

---

## Sidebar Structure

Left sidebar sections (all collapsible with chevron toggle):
1. **Research Dashboard** — Home base
2. **Symptoms** — Symptom research tool
3. **Interactions** — Safety check tool
4. **Visualization** — Visual read tool
5. **Pharmacy** — Finder tool
6. **History** — Past research
7. **Business** — Business Center, Sponsor, Advertiser, Affiliates, Policy Center

---

## Footer Structure

Global footer present on all pages:
```
© 2026 medmed.ai · Policy Center · Business Center · Support · Contact
```
- **Policy Center** → `/privacy`, `/terms`, `/policy`
- **Business Center** → `/business`
- **Support** → `/support`
- **Contact** → `support@medmed.ai`

---

## Global UI Rules

- **Header**: `Nav` — sticky, `medmed.ai` logo left (22px bold serif), nav links right-justified
- **Footer**: `Footer` — copyright (2026) left, Policy Center · Support · Contact right
- **No "AI" word** — always say "medmed.ai"
- **No "Medical Advice"** — always emphasize "informational research purposes"
- **No Guarantees** — never imply guarantees or definitive clinical outcomes
- **Branding**: 2026 is the current active year.

---

## Deployment

```bash
# Frontend (v2)
cd v2
npm run build
npx wrangler pages deploy dist --project-name=medmed

# Worker
cd workers/medmed-agent
npx wrangler deploy
```

Production: `https://medmed.pages.dev` (+ custom domain)
Worker: `https://medmed-agent.hellonolen.workers.dev`

---

## Plans & Pricing (2026)

- **Free Trial** — 3 days, CC required at signup
- **Pro** — unlimited questions, health profile memory, all tools
- **Max** — BYOA keys, priority support
- **Enterprise** — BYOA keys, custom integrations
- **Business** — Sponsor/Advertiser/Affiliate accounts
