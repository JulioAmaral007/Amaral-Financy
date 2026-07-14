# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Rumo" (package name `financy`) is a personal bill-splitting app: Next.js 16 App Router, React 19,
TypeScript, Tailwind 4. It is a **single-user, client-side app** — all data lives in the browser's
`localStorage`, there is no backend, no auth, and no login. It opens straight to the dashboard.

One user-facing area (the dashboard, `/`, `app/_dashboard/`):
- **Calculator** — given up to three salaries, computes how a bill should be split
  (`services/bill-split.service.ts:calculateSalarySplit`): salary 1 pays first up to its own limit, then the
  remainder splits proportionally between salary 2/3.
- **Fixed bills** — recurring bills with a payer, due day and derived status.
- **History** — one entry per calculation, with a monthly chart of fixed + one-off spending across the year.

> This app used to have Investments, PJ (freelance tracking) and Supabase-backed auth/account features. Those
> were **removed** — don't try to "restore" them. There is no Supabase, no Server Actions, no server-side
> persistence in this project anymore.

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run start    # run production build
npm run lint     # ESLint (eslint-config-next core-web-vitals + typescript)
```

No test runner is configured. No environment variables are required — there is no `.env.local`.

## Architecture — everything runs in the browser

```
Component ("use client")
  → actions/*.actions.ts    plain async function (NOT "use server") — zod-parse, call service, return {error} state
  → services/*.service.ts   business rules, decoration / derived view models
  → repositories/*.repository.ts   read/write localStorage, soft-delete, id/timestamp generation
  → lib/local-storage/storage.ts   JSON.parse/stringify against window.localStorage
```

- `actions/calculate.actions.ts`, `actions/fixed-bill.actions.ts`, `actions/history.actions.ts` are plain async
  functions called directly from client components — **not** `"use server"`, not passed to `<form action>`, no
  server round-trip. localStorage isn't reachable on the server, so nothing here can run there.
- Client components import services directly (e.g. `profileService.getProfile()` inside a `useEffect`) — the
  whole read/write path is synchronous browser code wrapped in `Promise`s.
- **Soft delete** convention: a `deletedAt: string | null` field on an internal `Stored*` type
  (`StoredFixedBill`, `StoredHistoryEntry`), never a hard delete. Public repository functions strip it before
  returning.
- No server-side invalidation exists, so cross-component sync after a mutation uses a tiny `window` event bus:
  `lib/history-events.ts` (`emitHistoryUpdated` / `onHistoryUpdated`), plus a local `reloadKey` counter in the
  section components.
- Almost everything under `app/_dashboard/` is `"use client"`; the `*-section.tsx` files fetch data in a
  `useEffect` and render the view components. `app/_dashboard/` is route-private (`_` prefix) — it holds
  components, not pages; the actual route is `app/page.tsx`. `app/layout.tsx` is a plain server component
  (fonts, metadata, `<Header />`).

### `profile` — the dashboard's saved salaries

`types/profile.ts` + `repositories/profile.repository.ts`: the saved salary values (`salary1/2/3`), stored in
localStorage under `STORAGE_KEYS.PROFILE`. Used only by `actions/calculate.actions.ts` and the calculator form.

## Domain model

- **Salary split** (`types/bill-split.ts`, `services/bill-split.service.ts`): see "What this is" above. If total
  salaries can't cover the bill, `exceeds`/`shortfall` report the gap instead of rejecting the calculation.
- **Fixed bills** (`types/fixed-bill.ts`, `services/fixed-bill.service.ts`): recurring bills with a `payer` of
  `salary1`/`salary2`/`salary3`/`split` (the last runs through `calculateSalarySplit`), a `dueDay`, and a
  derived `status` (`overdue`/`upcoming`/`ok`) computed from today's date vs. `dueDay`.
- **History** (`types/history.ts`, `repositories/history.repository.ts`): one entry per calculation, paginated
  or filtered by date range, soft-deletable.
- **Person totals** (`getPersonTotalsForMonth` in `services/bill-split.service.ts`): aggregates fixed bills +
  history entries for a month into per-salary totals — feeds the dashboard summary/chart
  (`services/bill-split-chart.service.ts`).

## Conventions actually in effect

- Path alias `@/*` → repo root (see `tsconfig.json`).
- Keep the `actions / services / repositories / types / schemas` split per feature — match the existing files.
- `eslint.config.mjs` enforces the mechanical rules (no `any`, no `enum`, no non-null `!`, no `React.FC`,
  consistent type imports). If it fails, fix the code, not the rule.
- Currency is stored/computed in raw `number` (BRL), formatted for display via `lib/utils.ts`
  (`formatCurrencyBRL`, `formatCurrencyCompactBRL`) and parsed from masked input via
  `parseCurrencyInput`/`normalizeCurrencyDigits` (used by `components/ui/currency-input.tsx`).
- Rounding to cents uses `round2` from `lib/utils.ts` everywhere money math happens.
- Validation is zod-first: schemas live in `schemas/*.schema.ts` and the inferred type is the action's input
  type. Form schemas that use `CurrencyInput` (masked centavos strings) are a separate schema from the numeric
  schema.
- UI primitives (`components/ui/*`) are small, unstyled-opinionated components (button, card, badge, select,
  pagination, currency-input, toggle-check, receipt) — reuse them instead of introducing new form primitives.
- `README.md` describes an earlier, unbuilt version of this project — it does not reflect the current codebase.
  Don't treat it as a source of truth; this file supersedes it.
</content>
