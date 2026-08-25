# DEVLOG — PromptBudget

## Day 1 — 2026-05-16

**Hours worked:** 4

**What I did:**
- Set up Next.js 16 project with React 19, Tailwind v4, and shadcn/ui
- Built complete pricing database for 8 AI tools (Cursor, GitHub Copilot, Claude, ChatGPT, Gemini, Windsurf, Anthropic API, OpenAI API) with current May 2026 pricing
- Implemented the core audit engine with 4 rule-based evaluation checks:
  1. Plan fit check (is the user on the right tier for their team size?)
  2. Cheaper same-vendor plans (can they downgrade within the same tool?)
  3. Cheaper alternatives (is there a competitor that's cheaper for their use case?)
  4. Credex credit savings (can they save by purchasing through Credex?)
- Created type-safe data model covering tools, plans, audit I/O, leads, and API contracts
- Built three API routes: `/api/audit` (run + save), `/api/leads` (capture + email), `/api/summary` (Anthropic AI summary with template fallback)
- Implemented lead capture with honeypot anti-spam and in-memory rate limiting
- Built the landing page with hero, how-it-works, features grid, social proof, and CTA sections
- Built the audit input form with tool selector, plan/seats/spend per tool, localStorage persistence, and auto-calculated costs
- Built the results page with hero savings, AI summary, per-tool breakdown cards, Credex CTA, lead capture, and share functionality
- Set up dynamic OG/Twitter metadata for shareable result URLs
- Created PRICING_DATA.md with every number traced to official vendor URLs
- Configured Supabase client and Resend email client
- All three pages (landing, audit, results) rendering successfully

**What I learned:**
- Next.js 16 has breaking changes from my training data: `params` is now a Promise that must be awaited, and `PageProps<'/route'>` is a new globally-available helper type
- The AI tool market has changed significantly — Cursor now uses a credit system, GitHub Copilot is transitioning to usage-based billing, and OpenAI has introduced tiered Pro plans at $100/$200
- Building defensible audit logic requires careful reasoning about when plan downgrades make sense vs. when the premium features justify the cost

**Blockers / what I'm stuck on:**
- Need to create Supabase tables (have the SQL ready, need to run it)
- Anthropic API key is a placeholder — need a real key or will rely on template fallback
- Haven't tested the full audit → results flow end-to-end yet (need Supabase tables)

**Plan for tomorrow:**
- Create Supabase tables and test the full flow end-to-end
- Polish the UI: dark mode support, animations, loading states
- Add more comprehensive audit rules and edge case handling
- Start writing ARCHITECTURE.md and set up tests
- Begin user interview outreach (DM founders on X/LinkedIn)
