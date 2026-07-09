# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Rumo" (package name `financy`) is a personal finance app: Next.js 16 App Router, React 19, TypeScript, Tailwind 4.
It has grown from a single localStorage-only bill-splitting calculator into a hybrid app with **two coexisting
persistence models** — read the architecture section below before touching any feature, since the right pattern
to copy depends entirely on which one the feature belongs to.

Four user-facing areas:
- **Dashboard** (`/`, `app/_dashboard/`) — the original feature. Given up to three salaries, computes how a bill
  should be split (`services/bill-split.service.ts:calculateSalarySplit`): salary 1 pays first up to its own
  limit, then the remainder splits proportionally between salary 2/3. Also tracks recurring fixed bills and a
  calculation history with a monthly chart.
- **Goals** (`/goals`, `app/_goals/`) — investment goal simulator (target value, monthly contribution, CDI% or
  fixed annual rate) that projects a month-by-month balance and estimated completion date.
- **PJ** (`/pj`, `app/_pj/`) — freelance/hourly work cycle tracker: configure a pay cycle (date range, hourly
  rate, daily journey length, which weekdays count), check off worked days, and see predicted vs. actual
  earnings; closing a cycle archives it and auto-starts the next one.
- **Login / Account** (`/login`, `/profile`, `app/_auth/`, `app/_profile/`) — Supabase email/password auth and
  account settings (display name, notification prefs, CDI base rate default).

## Commands

```bash
npm run dev      # start dev server (Turbopack)
npm run build    # production build
npm run start    # run production build
npm run lint     # ESLint (eslint-config-next core-web-vitals + typescript)
```

No test runner is configured yet.

Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The Supabase
project's tables/RLS/triggers are **not** provisioned automatically — see `supabase/SETUP.md` and run the
migrations in `supabase/migrations/` (in filename order) manually in the Supabase SQL editor before auth,
goals, or PJ features will work end to end.

## Architecture — two pipelines, pick the right one

`.claude/rules/*` describes a Supabase + Server Actions architecture (RLS, repositories hitting
`supabase.from()`, `"use server"` actions, `revalidatePath`). That target shape is **fully real for Goals, PJ,
Auth, and Account** — but the original Dashboard feature (calculator, fixed bills, history) still runs entirely
client-side against `window.localStorage` and predates that ruleset. Don't "upgrade" the Dashboard feature to
Supabase or "restore" `"use server"` there without being asked; equally, don't add a localStorage repository
for a new Goals/PJ/Account feature. Check which pipeline a file belongs to (below) before copying a pattern
from a neighboring file.

### Pipeline A — Supabase (Goals, PJ, Auth, Account)

```
Component ("use client")
  → actions/*.actions.ts    "use server" — zod-parse input, call service, revalidatePath, translate errors
  → services/*.service.ts   business rules, decorate DB rows into view models, requireUserId() ownership check
  → repositories/*.repository.ts   supabase.from(...) queries, scoped by .eq("user_id", userId)
  → lib/supabase/{server,client,middleware}.ts   Supabase SSR clients (cookie-based sessions)
```

- Real Next.js Server Actions (`"use server"` at the top of the file) — see `actions/auth.actions.ts`,
  `actions/goal.actions.ts`, `actions/pj.actions.ts`, `actions/account.actions.ts`. Mutations call
  `revalidatePath` afterwards instead of the Dashboard's custom event bus.
- Repositories take an explicit `userId` and filter every query by it (`.eq("user_id", userId)`) — RLS is the
  backstop, not the only check. Services get the current user via `authService.getCurrentUser()` and throw if
  absent (see the repeated local `requireUserId()` helper in `services/goal.service.ts`, `services/pj.service.ts`).
- `lib/supabase/errors.ts` (`assertNoError`, `unwrapList`, `unwrapMaybe`) wraps every Supabase response so
  errors throw with repository context instead of silently returning `[]`/`null`.
- DB rows are `snake_case`; repositories map to/from camelCase domain types by hand (see `mapRow`/`toRowInput`
  in `repositories/goal.repository.ts`) — there is no generated `Database` type in this project despite what
  `.claude/rules/database.md` assumes.
- Route protection is in `proxy.ts` (the Next.js middleware file — note the non-standard filename), which calls
  `lib/supabase/middleware.ts:updateSession` to refresh the session and redirect unauthenticated users to
  `/login` (public paths: `/login`, `/auth/callback`).
- `app/layout.tsx` is a server component that calls `accountService.getAccountProfile()` for the header even
  though the Dashboard page it wraps is unrelated to Supabase.

### Pipeline B — localStorage (Dashboard: calculator, fixed bills, history)

```
Component ("use client")
  → actions/*.actions.ts    plain async function, no "use server" — zod-parse, call service, return {error} state
  → services/*.service.ts   business rules, decoration/derived view models
  → repositories/*.repository.ts   read/write localStorage, soft-delete, id/timestamp generation
  → lib/local-storage/storage.ts   JSON.parse/stringify against window.localStorage
```

- `actions/calculate.actions.ts`, `actions/fixed-bill.actions.ts`, `actions/history.actions.ts` are plain async
  functions called directly from client components — not passed to `<form action>`, no server round-trip.
  Don't add `"use server"` here; localStorage isn't reachable on the server anyway.
- Soft delete convention: a `deletedAt: string | null` field on an internal `Stored*` type
  (`StoredFixedBill`, `StoredHistoryEntry`), never a hard delete. Public repository functions strip it before
  returning.
- No server-side invalidation is possible, so cross-component sync after a mutation uses a tiny `window` event
  bus: `lib/history-events.ts` (`emitHistoryUpdated` / `onHistoryUpdated`).
- Almost everything under `app/_dashboard/` is `"use client"`; the `*-section.tsx` files are thin
  server-renderable wrapper shells. `app/_dashboard/` is route-private (`_` prefix) — it holds components, not
  pages; the actual route is `app/page.tsx`.

### `profile` vs `profiles` — same word, two unrelated concepts

- `types/profile.ts` + `repositories/profile.repository.ts` (Pipeline B): the Dashboard's saved salary values
  (`salary1/2/3`), stored in localStorage under `STORAGE_KEYS.PROFILE`. Used only by
  `actions/calculate.actions.ts`.
- `public.profiles` table + `repositories/account.repository.ts` + `services/account.service.ts` (Pipeline A):
  the real signed-in user's account row (name, notification prefs, `cdiBaseRate`), created automatically by a
  `handle_new_user` trigger on signup. Exposed as `AccountProfile` (`types/account.ts`).

These are intentionally separate and not migrating into each other — don't conflate them.

## Domain model

- **Salary split** (`types/bill-split.ts`, `services/bill-split.service.ts`): see "What this is" above. If
  total salaries can't cover the bill, `exceeds`/`shortfall` report the gap instead of rejecting the
  calculation.
- **Fixed bills** (`types/fixed-bill.ts`, `services/fixed-bill.service.ts`): recurring bills with a `payer` of
  `salary1`/`salary2`/`salary3`/`split` (the last runs through `calculateSalarySplit`), a `dueDay`, and a
  derived `status` (`overdue`/`upcoming`/`ok`) computed from today's date vs. `dueDay`.
- **History** (`types/history.ts`, `repositories/history.repository.ts`): one entry per calculation, paginated
  or filtered by date range, soft-deletable.
- **Person totals** (`getPersonTotalsForMonth` in `services/bill-split.service.ts`): aggregates fixed bills +
  history entries for a month into per-salary totals — feeds the dashboard summary/chart.
- **Goals** (`types/goal.ts`, `services/goal.service.ts`, `services/goal-math.service.ts`): a target value,
  optional initial/monthly contribution, and either a CDI-percentage or fixed annual rate. `goal-math.service.ts`
  compounds monthly to build a projection path, `monthsToGoal`, and `completionDate`. The account's
  `cdiBaseRate` (default 10.65) feeds the CDI-mode calculation.
- **PJ cycles** (`types/pj.ts`, `services/pj.service.ts`, `services/pj-math.service.ts`): one `active` cycle per
  user at a time, enforced by a Postgres partial unique index (`pj_cycles_one_active_per_user`), not just
  application logic. A cycle has a date range, hourly rate, `journeyMode` (`h4`/`h8`/`custom` hours/day), and a
  `weekdayPreset` deciding which weekdays generate a `pj_cycle_days` row. Days can be marked done with either a
  manual `hoursWorked` or four time-of-day fields (`morningStart/End`, `afternoonStart/End`) that
  `hoursWorkedFromTimes` converts to a duration. Closing a cycle (`pj.service.ts:closeCycle`) archives it with
  computed totals and immediately opens the next cycle via `buildNextCycleConfig`.
- **Date-only Postgres columns**: `goal.startDate` and all PJ cycle/day dates are Postgres `date` (no
  timezone). Never do `new Date(isoString)` on them — that parses as UTC midnight and can shift the calendar
  day depending on local timezone. Always go through `parseISODateLocal` (`services/goal-math.service.ts`).

## Conventions actually in effect

- Path alias `@/*` → repo root (see `tsconfig.json`).
- Import order and "one thing per file" from `.claude/rules/*` are followed in practice — keep new code
  consistent with the existing `actions/services/repositories/types/schemas` split per feature, and match
  whichever pipeline (A or B, above) the feature belongs to.
- Currency is stored/computed in raw `number` (BRL), formatted for display via `lib/utils.ts`
  (`formatCurrencyBRL`, `formatCurrencyCompactBRL`) and parsed from masked input via
  `parseCurrencyInput`/`normalizeCurrencyDigits` (used by `components/ui/currency-input.tsx`).
- Rounding to cents uses `round2` from `lib/utils.ts` everywhere money math happens.
- Validation is zod-first: schemas live in `schemas/*.schema.ts` and the inferred type is the action's input
  type. Client-facing form schemas that use `CurrencyInput` (masked centavos strings) are kept as a separate
  schema from the "real" numeric schema — see `pjCycleConfigFormSchema` vs. `configurePjCycleSchema` in
  `schemas/pj.schema.ts`.
- UI primitives (`components/ui/*`) are small, unstyled-opinionated components (button, card, badge, select,
  pagination, currency-input, toggle-check, receipt) — reuse them instead of introducing new form primitives.
- `README.md` describes an earlier, unbuilt version of this project (shadcn/ui, `(auth)`/`(home)` route groups,
  transactions/categories pages) — it does not reflect the current codebase. Don't treat it as a source of
  truth; this file supersedes it.
