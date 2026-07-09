# Comandos para subir as alterações

Estado atual: branch `main`, com a feature de **Metas (goals)** removida e substituída pela
feature de **Investimentos**, mais ajustes no PJ e helpers de data.

---

## Opção 1 — Commit único (mais simples)

```bash
git add -A

git commit -m "feat(investments): replace goals with investment portfolio tracking

- Remove savings goals feature (pages, components, service, repository, schema, types)
- Add investments: assets, allocation vs investor profile, emergency reserve,
  contributions/dividends, portfolio return vs CDI/IPCA and contribution simulator
- Add monthly snapshots as the basis for return calculation (cost vs value)
- Add lib/date.ts with timezone-safe helpers for Postgres date columns
- Drop unused pj_cycle_day.note column
- Update CLAUDE.md, SETUP.md and header navigation"

git push origin main
```

---

## Opção 2 — Commits separados (histórico mais limpo)

```bash
# 1. Helpers de data (base para os demais commits)
git add lib/date.ts
git commit -m "feat(lib): add timezone-safe helpers for date-only columns"

# 2. Ajustes no PJ
git add supabase/migrations/20260709000000_drop_pj_cycle_day_note.sql \
        repositories/pj-cycle-day.repository.ts \
        schemas/pj.schema.ts \
        services/pj-math.service.ts \
        services/pj.service.ts \
        types/pj.ts \
        app/_pj/
git commit -m "refactor(pj): drop unused day note and use local date parsing"

# 3. Remoção das metas
git add -u actions/goal.actions.ts \
           app/_goals/ \
           app/goals/ \
           repositories/goal.repository.ts \
           schemas/goal.schema.ts \
           services/goal-math.service.ts \
           services/goal.service.ts \
           types/goal.ts
git commit -m "feat(goals): remove savings goals feature"

# 4. Investimentos
git add supabase/migrations/20260710000000_replace_goals_with_investments.sql \
        actions/investment.actions.ts \
        app/_investments/ \
        app/investments/ \
        repositories/investment-*.repository.ts \
        schemas/investment.schema.ts \
        services/investment*.service.ts \
        types/investment.ts
git commit -m "feat(investments): add portfolio tracking with assets, allocation and returns"

# 5. Restante (UI, docs, navegação)
git add -A
git commit -m "chore: update navigation, shared UI and project docs"

git push origin main
```

---

## Antes de subir

```bash
npm run lint     # checar ESLint
npm run build    # garantir que o build passa
git status       # conferir o que vai no commit
```

> Lembre-se de rodar as migrations em `supabase/migrations/` no SQL editor do Supabase
> (na ordem do nome do arquivo) antes de testar a feature de investimentos.
