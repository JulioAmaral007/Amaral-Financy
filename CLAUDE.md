# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Rumo" (package name `financy`) is a personal bill-splitting app: Next.js 16 App Router, React 19,
TypeScript, Tailwind 4. It is a **single-user, client-side app** — all data lives in the browser's
`localStorage`, there is no backend, no auth, and no login. It opens straight to the dashboard.

One user-facing area (the dashboard, `/`, `app/_dashboard/`), organised **around a month**. It replaces the
owner's "controle financeiro" Excel sheet (one tab per month). A month selector (`?mes=2026-11`, see
`app/_dashboard/use-selected-month.ts`) drives every section:
- **Divisão do mês** (`calculator-*`) — INSS + Extra Pai ("salary 1") pay first; the remaining balance goes to
  Thais ("salary 2") and Julio ("salary 3"), either **50/50** (`equal`, what the sheet did) or proportional to
  salary (`proportional`, `calculateSalarySplit`). The mode is chosen per month. Inputs auto-save (debounced);
  "Registrar divisão" writes a snapshot to history.
- **Gastos do mês** (`spending-*`) — the sheet's second tab: dated purchases per category (Carne, Gasolina,
  Mercado, Outros) with *estimado / gasto / saldo*. Their sum is the "cartão de crédito" line of the month.
- **Contas do mês** (`fixed-bills-*`) — the monthly bills (Unimed, água, internet…). Bills belong to a month
  (`FixedBill.month`); an empty month can copy the previous month's bills. `includedInBill` = "counts in the total".
- **Histórico** (`history-*`) — the divisions registered for the selected month. The year chart is the month
  navigator itself (`year-ruler.tsx`: one bar per month, click to open it).
- **Perfil** (`workspace-*`) — the top bar switches between independent data sets ("Casa", "Pessoal"…). Each
  profile has its own bills, spending, month settings, history and saved salaries, plus a `splitEnabled` flag:
  with it off the profile shows only a month summary (`month-summary-card.tsx`), no Divisão/histórico.
- **Backup** — export/import of every profile's data as JSON (`schemas/backup.schema.ts`, v2); import replaces all.

Month total = included bills + spending (`services/month.service.ts:computeMonthTotals`) — the sheet's "TOTAL".
Saldo a dividir = total − (INSS + Extra Pai).

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

- `actions/*.actions.ts` (calculate, fixed-bill, history, month, spending, backup) are plain async
  functions called directly from client components — **not** `"use server"`, not passed to `<form action>`, no
  server round-trip. localStorage isn't reachable on the server, so nothing here can run there.
- Client components import services directly (e.g. `profileService.getProfile()` inside a `useEffect`) — the
  whole read/write path is synchronous browser code wrapped in `Promise`s.
- **Soft delete** convention: a `deletedAt: string | null` field on an internal `Stored*` type
  (`StoredFixedBill`, `StoredHistoryEntry`, `StoredSpending`), never a hard delete. Public repository functions strip it before
  returning.
- No server-side invalidation exists, so cross-component sync after a mutation uses a tiny `window` event bus:
  `lib/history-events.ts`, `lib/fixed-bill-events.ts`, `lib/month-events.ts` (spending + month settings). The
  sections subscribe to all three through `app/_dashboard/use-data-reload-key.ts` and reload in a `useEffect`
  keyed by `[month, reloadKey]`. Mutations just call the matching `emit…Updated()`.
- Sections must not render another month's data while the selected month is loading: they keep the loaded
  `month` next to the data and return `null` until it matches (`snapshot.month !== month`).
- Almost everything under `app/_dashboard/` is `"use client"`; the `*-section.tsx` files fetch data in a
  `useEffect` and render the view components. `app/_dashboard/` is route-private (`_` prefix) — it holds
  components, not pages; the actual route is `app/page.tsx`. `app/layout.tsx` is a plain server component
  (fonts, metadata, `<Header />`).

### `profile` and month settings

`types/profile.ts` + `repositories/profile.repository.ts`: saved salary values (`salary1/2/3`) under
`STORAGE_KEYS.PROFILE`. `salary2/3` (Thais/Julio) are only used by the proportional split; `salary1` is just the
default INSS when no earlier month exists.

`types/month.ts` + `repositories/month-settings.repository.ts` (`STORAGE_KEYS.MONTHS`, a `Record<"YYYY-MM",
MonthSettings>`): per-month INSS, Extra Pai, split mode and the per-category *valor estimado*. A month with no
settings of its own **inherits** from the latest earlier month (extra pai resets to 0) —
`month.service.getMonthSettings`. Settings are only written when something is edited.

### Profiles (workspaces)

`types/workspace.ts` (not to be confused with `Profile` = saved salaries), `repositories/workspace.repository.ts`
(list under `financy:workspaces`, soft-deleted, active id under `financy:active-workspace`). Isolation is done by
**localStorage key namespacing** (`lib/local-storage/keys.ts`): the default profile `casa` keeps the original keys
(`financy:fixed-bills`…, so pre-profile data needed no migration); others use `financy:ws:<id>:<name>`.
`STORAGE_KEYS.X` are getters that resolve the **active** profile on every access — repositories keep using them
unchanged, so any new per-profile store must be added to `WORKSPACE_DATA_NAMES` and the backup schema.
Switching/creating/editing a profile ends in `window.location.reload()` (fresh state, no stale sections, and
pending debounced saves can't leak into another profile). Removing a profile is a soft delete (data kept,
restorable from the edit panel); the last profile can't be removed.

Names shown for the three "salaries" live in `lib/people.ts` — change them there, not in components.

## Domain model

- **Salary split** (`types/bill-split.ts`, `services/bill-split.service.ts`): `calculateMonthSplit(mode, …)`
  dispatches to `calculateEqualSplit` (50/50 of what's left after salary 1) or `calculateSalarySplit`
  (proportional, R$ 500 floor). If salaries can't cover the bill in proportional mode, `exceeds`/`shortfall`
  report the gap instead of rejecting the calculation.
- **Fixed bills** (`types/fixed-bill.ts`, `services/fixed-bill.service.ts`): bills of one `month`. New bills
  start `includedInBill: true`. Legacy records without `month` are migrated to the current month on first read
  (`fixed-bill.repository.readAll`). Zero-valued bills aren't representable in the UI (amount must be > 0).
- **Spending** (`types/month.ts`, `services/spending.service.ts`): `date` is a `"YYYY-MM-DD"` string; its month is
  `date.slice(0, 7)` (`monthKeyFromDate`) — never derive it through `Date`/timezone.
- **Parcelamento** (`Spending.installment = { groupId, number, total }`): a compra parcelada vira N `Spending`
  independentes, uma por mês (`addMonthsToDate` em `lib/month.ts`), criadas por
  `spending.repository.createInstallmentSpendings`. O valor digitado é o **total**; a última parcela absorve os
  centavos. Cada parcela é editável isoladamente; "remover esta e as seguintes" usa `deleteInstallmentsFrom`.
- **History** (`types/history.ts`, `repositories/history.repository.ts`): one entry per "Registrar divisão",
  carrying its `month` (legacy entries fall back to the month of `calculatedAt`), soft-deletable. The chart does
  **not** read history — monthly totals come from bills + spending (`month.service.getTotalsByMonth`,
  `services/bill-split-chart.service.ts`).
- **Backup** (`schemas/backup.schema.ts`, `services/backup.service.ts`): v2 =
  `{ app: "rumo", version: 2, activeWorkspaceId, workspaces: [{ …workspace, data }] }`. v1 files (single data
  set, pre-profiles) are still accepted and become the "Casa" profile. Workspace ids end up in storage keys, so the
  schema restricts them to `[A-Za-z0-9-]`. Keep the schema in sync when adding a per-profile store.

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
- UI primitives (`components/ui/*`) are small, opinionated components (button, card + CardHeader, badge, input,
  select, pagination, currency-input, toggle-check) — reuse them instead of introducing new form primitives.

### Visual design

Tokens live in `app/globals.css` (`bg`, `surface`, `sunken`, `ink`, `muted`, `faint`, `line`, `good`, `bad`) plus one
fixed color per person: `pai` (amarelo), `thais` (azul), `julio` (tomate). Person colour classes are centralised in
`app/_dashboard/people-colors.ts`. Fonts: Bricolage Grotesque (`font-display`, titles and money via `.money`) and
Onest (body). The signature element is the split bar (`split-bar.tsx`) at the top of the month; light gamification
is the month-closing ring (`month-progress.tsx`, confetti on completion) and the budget streak
(`month.service.getBudgetStreak`). Copy is pt-BR, sentence case, no uppercase-tracking labels.

**Density.** The dashboard is tuned so the important numbers need minimal scrolling: at 1280×900 the month hero,
the spending card and the bills are visible without scrolling. Desktop is two columns (`app/page.tsx`: spending left; bills +
divisions stacked right). The spending list shows 5 rows then "Ver todos". On phones `section-nav.tsx` is a floating
shortcut bar (Mês · Gastos · Contas · Divisões) driven by the card ids `mes`/`gastos`/`contas`/`divisoes` — keep those
ids if you restructure the sections. Prefer one-line list rows and inline controls over new stacked rows.

**Dark mode.** Every colour is a CSS variable in `app/globals.css`, redefined for dark under
`@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` and again under `:root[data-theme="dark"]` —
keep both blocks in sync. Use tokens, never `text-white`/`bg-white`/hex in components: text on an `bg-ink` surface is
`text-on-ink`, on the Thais blue `text-on-thais`, on the yellow/tomato slices `text-onyx`; shadows are `shadow-card`,
`shadow-pill`, `shadow-raised`, `shadow-pop` (in dark they include a 1px light edge instead of relying on shadow).
The preference (`system`/`light`/`dark`) lives in `lib/theme.ts` (localStorage `rumo:theme`, not part of the backup);
`THEME_INIT_SCRIPT` runs in `<head>` before paint to avoid a flash; `components/layout/theme-toggle.tsx` cycles it.
`text-faint` is only for placeholders/decorative/disabled — it is below 4.5:1, so informative small text uses
`text-muted`. Tabular figures only on money (`.money`); Onest's tabular digits look gappy in running text.
- `README.md` describes an earlier, unbuilt version of this project — it does not reflect the current codebase.
  Don't treat it as a source of truth; this file supersedes it.
</content>
