# CivicProof

Turn a real-world problem into an actionable, trackable case.

CivicProof takes a citizen's unstructured incident report and turns it into a
structured, evidence-backed, AI-assisted case that can be directed toward the
appropriate official reporting channel and tracked through to resolution.

It deliberately does **not** replace emergency services, the police, or any
official authority, does not determine guilt, and never claims that a complaint
was officially submitted unless that genuinely happened.

The full product specification lives in [`Docs/`](./Docs) (documents 01–14).

## Status

Project shell only. The reporting workflow, database, authentication and AI
assistance are implemented in later tasks of
[`Docs/12-IMPLEMENTATION-PLAN.md`](./Docs/12-IMPLEMENTATION-PLAN.md).

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js (App Router) + React + TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Backend | Next.js Route Handlers |
| Database | Neon PostgreSQL + Prisma *(not wired up yet)* |
| Auth | Clerk *(not wired up yet)* |
| AI | OpenAI API, server-side only *(not wired up yet)* |
| Evidence storage | Vercel Blob *(not wired up yet)* |
| Hosting | Vercel |

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in values as later tasks need them
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then type-check |

## Environment variables

`.env.example` lists the required variable **names** only. Real values belong in
`.env.local`, which is gitignored. Never commit a secret; only
`NEXT_PUBLIC_*` variables are exposed to the browser.
