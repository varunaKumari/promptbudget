# PromptBudget

PromptBudget is a Next.js app for auditing AI tool spend, benchmarking subscription costs, and surfacing savings recommendations for startup and engineering teams.

## Repository Layout

```txt
.
+-- client/                 # Next.js application
|   +-- app/                # App Router pages and API routes
|   +-- components/         # UI, auth, chat, dashboard, and landing components
|   +-- hooks/              # Client-side React hooks
|   +-- lib/                # Audit engine, pricing data, AI, auth, and chat logic
|   +-- public/             # Static assets
|   +-- __tests__/          # Vitest tests
+-- server/                 # Server-side database assets
|   +-- supabase/           # Supabase migrations
+-- .github/workflows/      # CI workflow
```

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- Supabase
- Anthropic/OpenAI AI SDK integrations
- Resend
- Vitest
- ESLint

## Getting Started

```bash
cd client
npm install
npm run dev
```

The app runs locally at `http://localhost:3000` by default.

## Environment Variables

Create `client/.env.local` and provide the values required by the features you plan to use:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

AI summaries, email delivery, authentication, and persistence depend on the corresponding service keys. The deterministic audit engine and unit tests can run without live service credentials.

## Scripts

Run all commands from `client/`.

```bash
npm run dev       # Start the local Next.js dev server
npm run build     # Build the production app
npm run start     # Start the production server after a build
npm run lint      # Run ESLint
npm run test      # Run Vitest tests
npx tsc --noEmit  # Type-check the project
```

On Windows PowerShell, if script execution blocks `npm`, use `npm.cmd` instead:

```powershell
npm.cmd run lint
npm.cmd test
```

## Database

Supabase migrations live in `server/supabase/migrations/`. Apply them to the target Supabase project before relying on chat history, personalization memory, or feedback persistence.

## CI

GitHub Actions is configured at `.github/workflows/ci.yml`. The workflow runs from the repository root but executes Node commands in `client/`:

- install dependencies with `npm ci`
- lint with `npm run lint`
- test with `npm run test`
- type-check with `npx tsc --noEmit`
- build with `npm run build`

## Verification

The latest local verification passed:

```bash
npm.cmd test
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```
