# medmed.ai v2 — Research Interface

This directory contains the 2026 edition of the **medmed.ai** research interface, built as a high-performance Single Page Application (SPA).

## Key Principles

- **Liability-Safe**: No clinical guarantees, medical advice, or definitive diagnoses.
- **Informational Focus**: All tools (Symptoms, Interactions, Visualization) are for research purposes.
- **Branding**: Use the 2026 copyright and ensure the logo is 22px bold serif.
- **Anti-AI Terminology**: Avoid "AI", "Agentic", "Medical", or "Clinical" in all user-facing copy.

## Project Structure

- `src/components/Nav.tsx`: Branding and navigation header.
- `src/components/Footer.tsx`: Standardized 2026 footer.
- `src/pages/Dashboard.tsx`: Central research hub.
- `src/pages/Landing.tsx`: Public-facing marketing.
- `src/pages/Legal.tsx`: Policy and support documents.

## Configuration

- **API Base**: Proxied to `api.medmed.ai` (Vite dev server) or direct (production).
- **Environment**: Managed via Cloudflare Pages.

## Commands

```bash
npm install
npm run dev     # Starts development server
npm run build   # Build for production
```
