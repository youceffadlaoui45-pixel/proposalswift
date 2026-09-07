# ProposalSwift

Generate, send, and track professional client proposals — with e-signature and
Stripe deposit payments — built for freelancers and small agencies.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS, Lucide icons
- **Backend:** Express (proxies AI generation, scaffolds real Stripe Checkout)
- **AI:** Anthropic Claude (Messages API) — turns rough notes into a structured proposal
- **Payments:** Stripe (deposit checkout — simulated in the UI by default, real endpoint included)
- **Data model:** `docs/schema.sql` (Users, Clients, Proposals, Payments)

## Quick start

```bash
npm install
cp .env.example .env        # then add your ANTHROPIC_API_KEY
```

Run the API server and the frontend in two terminals:

```bash
npm run server   # http://localhost:3001 — AI + Stripe backend
npm run dev      # http://localhost:5173 — the app
```

Open http://localhost:5173.

> Without an `ANTHROPIC_API_KEY`, the "Generate with AI" button still works —
> it falls back to a built-in template generator so the app is fully usable
> out of the box. Add the key to get real AI-written proposals.

## Project structure

```
proposalswift/
├── index.html              # HTML entry, loads Fraunces / Inter / Caveat fonts
├── package.json
├── vite.config.js          # dev server + /api proxy to Express
├── tailwind.config.js      # brand colors + font families
├── postcss.config.js
├── .env.example
├── src/
│   ├── main.jsx             # React root
│   ├── index.css            # Tailwind directives
│   └── App.jsx               # the whole app: dashboard, builder, preview,
│                              # client-facing view, signature, payment modal
├── server/
│   └── index.js              # Express API: /api/generate-proposal (Anthropic proxy),
│                              # /api/create-checkout-session (Stripe, ready to wire up)
└── docs/
    └── schema.sql             # Postgres schema: users, clients, proposals, payments
```

## What's real vs. simulated

This is a self-contained frontend demo with a working AI backend, so it runs
immediately without a database:

| Feature | Status |
|---|---|
| Proposal builder, AI generation, editor | Fully working |
| Dashboard metrics, status tracking | Fully working, computed from in-memory state |
| "Viewed" tracking on client open | Fully working (client-side simulation) |
| E-signature | Fully working (typed signature, stored in state) |
| AI writer | Real Claude call via `server/index.js`, with an offline fallback template |
| Stripe payment | Simulated checkout modal in the UI. `server/index.js` includes a real, working `/api/create-checkout-session` endpoint you can wire the "Pay Securely via Stripe" button to — it just isn't connected by default since it needs a live Stripe account and a webhook handler to confirm payment server-side. |
| Persistence | In-memory only (state resets on refresh). `docs/schema.sql` is the schema for adding a real database. |

## Wiring up real data + payments (next steps)

1. Add a database (Postgres recommended) using `docs/schema.sql` as the schema, and an ORM of your choice (Prisma, Drizzle, Knex).
2. Replace the in-memory `proposals` state in `src/App.jsx` with API calls to new Express routes (`GET/POST /api/proposals`, etc.) backed by that database.
3. Add auth (e.g. sessions or JWT) so `users` map to real accounts instead of the hardcoded "Alex Rivera".
4. Point the "Pay Securely via Stripe" button at `POST /api/create-checkout-session` (already implemented in `server/index.js`) and redirect to the returned `url`.
5. Add a Stripe webhook endpoint (`checkout.session.completed`) to mark the proposal `Paid` server-side — don't trust the client to report its own payment status.

## Design tokens

- Deep Slate `#1e293b` — primary text (`slate-800`)
- Indigo `#4f46e5` — brand / actions (`indigo-600`)
- Emerald `#10b981` — paid / success (`emerald-500`)
- Amber `#f59e0b` — viewed / attention (`amber-500`)
- Violet `#8b5cf6` — signed (`violet-500`)
- Fraunces (serif) for the proposal document itself; Inter for app UI; Caveat for the rendered signature
