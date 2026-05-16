<<<<<<< HEAD
# PromptBudget

**Free AI Spend Audit for Startups** — Find out if you're overspending on Cursor, Copilot, Claude, ChatGPT, and more.

🔗 **Live**: [https://promptbudget.vercel.app](https://promptbudget.vercel.app)

---

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/promptbudget.git
cd promptbudget

# Install
npm install

# Set up environment
cp .env.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
# RESEND_API_KEY, ANTHROPIC_API_KEY, NEXT_PUBLIC_APP_URL

# Run Supabase migrations (see ARCHITECTURE.md for SQL)

# Dev
npm run dev       # → http://localhost:3000

# Test
npm run test      # 30 tests, ~300ms

# Build
npm run build
```

## What It Does

PromptBudget audits your team's AI tool subscriptions and finds savings. For each tool, it checks:

1. **Plan fit** — Are you on the right plan for your team size?
2. **Cheaper plans** — Is there a cheaper plan from the same vendor?
3. **Alternatives** — Is there a cheaper tool with similar capabilities?
4. **Credex credits** — Can you save by purchasing through Credex?

Results include a per-tool breakdown, personalized AI summary (via Claude), and shareable URL with OG tags.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Email | Resend |
| AI | Anthropic Claude API (with template fallback) |
| Testing | Vitest (30 tests, 8 groups) |
| CI/CD | GitHub Actions |
| Hosting | Vercel |

## Features

- ✅ **10 AI tools** in the pricing database (Cursor, Copilot, Claude, ChatGPT, Gemini, Windsurf, v0, Replit, Anthropic API, OpenAI API)
- ✅ **4-rule audit engine** with defensible, hardcoded logic
- ✅ **AI summary** via Anthropic Claude with graceful template fallback
- ✅ **Lead capture** with honeypot anti-spam and rate limiting
- ✅ **Shareable URLs** with dynamic OG/Twitter card metadata
- ✅ **Benchmark mode** — compare your spend/dev against industry averages
- ✅ **Spend charts** — bar chart and donut chart visualizations (pure CSS, no libraries)
- ✅ **Dark mode** with system preference detection
- ✅ **Form persistence** via localStorage
- ✅ **30 automated tests** across 8 test groups
- ✅ **CI pipeline** — lint, test, type check, build

## 5 Trade-Offs I Made

1. **Server-side audit vs. client-side**: Chose server-side to protect pricing data from being scraped via the client bundle. Trade-off: adds a network round-trip to get results.

2. **Hardcoded logic vs. AI-generated recommendations**: All audit rules are hardcoded. This makes them verifiable (a finance person can check) but means adding new rules requires code changes. AI-generated advice would be non-deterministic.

3. **In-memory rate limiting vs. Redis**: Used a simple in-memory Map for rate limiting. It resets on deploy, which means it's not persistent across serverless instances. Trade-off: simplicity and zero infrastructure vs. robustness.

4. **Pure CSS charts vs. chart library**: Built the bar and donut charts with CSS (flexbox, conic-gradient). Trade-off: lightweight and no dependencies, but limited interactivity compared to D3 or Recharts.

5. **Template fallback vs. error state for AI summary**: When the Anthropic API fails, we show a templated summary instead of an error. Trade-off: always shows something useful, but the template is less personalized than the AI version.

## Project Structure

```
promptbudget/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Landing page
│   ├── audit/page.tsx      # Audit input form
│   ├── results/[id]/       # Results page (server + client)
│   └── api/                # API routes (audit, leads, summary)
├── components/             # React components
├── lib/                    # Core logic (types, pricing, engine, benchmarks)
├── __tests__/              # Vitest test suite
├── .github/workflows/      # CI pipeline
└── [docs]                  # ARCHITECTURE, DEVLOG, GTM, etc.
```

## Required Files

| File | Description |
|------|-------------|
| `README.md` | This file |
| `ARCHITECTURE.md` | System design, data flow, stack rationale |
| `DEVLOG.md` | Daily build log |
| `REFLECTION.md` | 5 reflective answers |
| `TESTS.md` | Test documentation |
| `PRICING_DATA.md` | Pricing sources with URLs |
| `PROMPTS.md` | AI prompt design and iterations |
| `GTM.md` | Go-to-market strategy |
| `ECONOMICS.md` | Unit economics |
| `USER_INTERVIEWS.md` | 3 user conversations |
| `LANDING_COPY.md` | Landing page copy |
| `METRICS.md` | North star + metrics framework |
| `.github/workflows/ci.yml` | CI pipeline |

## License

Built for the Credex Web Development Intern assessment. Not for redistribution.
=======
# promptbudget
AI spend auditor — find waste in your AI tool subscriptions instantly
>>>>>>> d56e6a002d0711d7eea392f21404796086d74eec
