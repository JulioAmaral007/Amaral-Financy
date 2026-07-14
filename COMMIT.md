# Comandos para subir as alterações

Estado atual: branch `main`. As features de **Investimentos** e **PJ** foram removidas, todo o
**Supabase** (auth, conta, perfil, middleware e clientes) saiu junto, e o app voltou a ser
**single-user client-side** com persistência em `localStorage` só no Dashboard. Além disso, o
layout do Dashboard foi reorganizado (gráfico em cima; calculadora e cupom lado a lado) e o cupom
de divisão passou a aparecer vazio antes do cálculo.

> Antes de commitar, confira: `npm run lint` e `npm run build` devem passar (ambos passaram aqui).

---

## Opção 1 — Commit único (mais simples)

```bash
git add -A

git commit -m "refactor: remove investments, PJ and Supabase; keep localStorage dashboard

- Remove Investments feature (pages, components, service, repository, schema, types)
- Remove PJ (freelance cycle) feature (pages, components, service, repository, schema, types)
- Remove all Supabase usage: auth, account, profile, route middleware and SSR clients
- Drop login/auth: app is now single-user and client-side only (localStorage)
- Remove @supabase/ssr and @supabase/supabase-js and Supabase-specific ESLint rules
- Simplify header (no nav tabs / profile) and layout (no account fetch)
- Reorder dashboard: chart on top, calculator and coupon side by side
- Show an empty division coupon before the first calculation
- Rewrite CLAUDE.md to describe the current single-feature app

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"

git push origin main
```

---

## Opção 2 — Commits separados (histórico mais limpo)

```bash
# 1. Remover a feature de PJ
git add -A actions/pj.actions.ts \
           app/_pj/ \
           app/pj/ \
           repositories/pj-cycle.repository.ts \
           repositories/pj-cycle-day.repository.ts \
           schemas/pj.schema.ts \
           services/pj.service.ts \
           services/pj-math.service.ts \
           types/pj.ts
git commit -m "refactor(pj): remove freelance cycle tracking feature

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"

# 2. Remover a feature de Investimentos
git add -A actions/investment.actions.ts \
           app/_investments/ \
           app/investments/ \
           repositories/investment-asset.repository.ts \
           repositories/investment-income.repository.ts \
           repositories/investment-settings.repository.ts \
           repositories/investment-snapshot.repository.ts \
           schemas/investment.schema.ts \
           services/investment.service.ts \
           services/investment-math.service.ts \
           services/investment-view.service.ts \
           types/investment.ts \
           lib/date.ts
git commit -m "refactor(investments): remove portfolio tracking feature

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"

# 3. Remover Supabase, auth, conta e todo o pipeline de servidor
git add -A actions/auth.actions.ts \
           actions/account.actions.ts \
           app/_auth/ \
           app/login/ \
           app/auth/ \
           app/_profile/ \
           app/profile/ \
           repositories/auth.repository.ts \
           repositories/account.repository.ts \
           schemas/auth.schema.ts \
           schemas/account.schema.ts \
           services/auth.service.ts \
           services/account.service.ts \
           types/account.ts \
           lib/supabase/ \
           proxy.ts \
           supabase/ \
           app/layout.tsx \
           components/layout/header.tsx \
           eslint.config.mjs \
           package.json \
           package-lock.json
git commit -m "refactor(auth): drop Supabase auth/account and make app localStorage-only

App is now single-user and client-side: no login, no server pipeline, no
route middleware. Removes the Supabase SSR clients and dependencies, the
Supabase-specific ESLint rules, and the account fetch / nav tabs from the shell.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"

# 4. Reorganizar o Dashboard e mostrar o cupom vazio
git add -A app/page.tsx \
           app/_dashboard/calculator-section.tsx \
           app/_dashboard/calculator-result-panel.tsx
git commit -m "feat(dashboard): stack chart with side-by-side calculator and coupon

Chart spans the full width on top; the calculator and the division coupon sit
side by side below it. The coupon now renders an empty state (dashes, no stamp)
before the first calculation.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"

# 5. Atualizar a documentação
git add -A CLAUDE.md COMMIT.md
git commit -m "docs: rewrite CLAUDE.md for the single-feature localStorage app

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"

git push origin main
```

---

## Observação — pasta `.claude/`

O `git status` também mostra mudanças em `.claude/` (regras antigas em `.claude/rules/*.md`
apagadas e uma pasta `.claude/` nova sem rastrear) que **são anteriores e não fazem parte desta
alteração**. Trate-as num commit próprio, se quiser versioná-las:

```bash
git add -A .claude/
git commit -m "chore: reorganize .claude rules"
```
</content>
