# PromptBudget Client

This directory contains the Next.js application for PromptBudget.

For repository-level setup, CI, and database notes, see `../README.md`.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000` after the dev server starts.

## Scripts

```bash
npm run dev       # Start the Next.js dev server
npm run build     # Build for production
npm run start     # Start the production server
npm run lint      # Run ESLint
npm run test      # Run Vitest tests
npx tsc --noEmit  # Run TypeScript checks
```

If PowerShell blocks the `npm` shim on Windows, use `npm.cmd`:

```powershell
npm.cmd run lint
npm.cmd test
```

## Key Directories

```txt
app/          App Router pages and API routes
components/   UI, auth, chat, dashboard, and landing components
hooks/        React hooks
lib/          Audit engine, pricing data, auth, AI, and chat logic
public/       Static assets
__tests__/    Vitest test suite
```

## Environment

Create `.env.local` in this directory:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Only the features backed by each external service require its key.
