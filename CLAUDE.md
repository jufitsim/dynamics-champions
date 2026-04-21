# Dynamics 365 Champions Directory

Customer-facing directory of Dynamics 365 Champions. Users submit their profile; admin approves before it appears publicly.

## Stack

- **React 18 + Vite + TypeScript + Tailwind CSS**
- **Supabase** — Postgres DB, Storage (photos), Auth (admin login)
- **Azure Static Web Apps** — hosting + CI/CD from GitHub

## Routes

| Path | Page |
|------|------|
| `/` | Public directory — browse & filter approved champions |
| `/join` | Submit form — any visitor can apply |
| `/admin` | Admin dashboard — sign in, approve/reject, manage workloads |

## Commands

```bash
npm install          # install dependencies
npm run dev          # local dev server (http://localhost:5173)
npm run build        # production build → dist/
npm run deploy       # build + swa deploy (requires swa cli login)
```

## Environment variables

Create `.env.local` for local dev (never commit):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Add these same values as **GitHub repository secrets** for CI/CD:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `AZURE_STATIC_WEB_APPS_API_TOKEN`  ← from Azure portal when creating the SWA

## First-time setup checklist

### 1. Supabase

1. Create a new project at https://supabase.com
2. Go to **SQL Editor** → run `supabase/migrations/001_initial.sql`
3. In **Authentication → Users**, create an admin user (your email + password)
4. Copy the **Project URL** and **anon public key** from Settings → API

### 2. Azure Static Web Apps

1. In the Azure portal, create a new **Static Web App**
2. Connect it to your GitHub repo (branch: `main`)
3. Set App location: `/`, Output location: `dist` — then **override** with the workflow already in `.github/workflows/`
4. Copy the **deployment token** from Deployment → Manage deployment token

### 3. GitHub secrets

In your repo → Settings → Secrets and variables → Actions, add:
- `AZURE_STATIC_WEB_APPS_API_TOKEN`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Push to `main` → GitHub Actions builds and deploys automatically.

## Key files

- `src/components/ChampionCard.tsx` — baseball-card styled profile card
- `src/components/FilterBar.tsx` — search + workload filter
- `src/pages/Admin.tsx` — admin dashboard (approve/reject, manage workloads)
- `src/pages/Submit.tsx` — public registration form
- `src/lib/supabase.ts` — Supabase client + image upload helper
- `supabase/migrations/001_initial.sql` — full DB schema + RLS + storage
