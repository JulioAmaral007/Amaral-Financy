-- Rumo: todos os dados do app, por usuário (RLS), no Supabase.
--
-- Rode manualmente no SQL Editor (Project -> SQL Editor -> New query). É idempotente.
--
-- Convenções:
--   * `user_id` vem de `auth.uid()` por padrão e toda policy compara com ele: cada pessoa só enxerga o que é dela.
--   * `workspace_id` é o perfil ("casa" é o padrão, os demais são uuids gerados no app). Não há FK para
--     `workspaces`: perfis só sofrem soft delete e o perfil padrão é criado sob demanda pelo app.
--   * Soft delete: `deleted_at` em vez de apagar a linha (como na versão com localStorage).
--   * Ids são gerados pelo app (`crypto.randomUUID()`), por isso a PK é (user_id, id): o mesmo backup pode ser
--     importado por duas contas sem colisão.

-- Perfis (Casa, Pessoal…) -----------------------------------------------------------------------------------

create table if not exists public.workspaces (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null check (id ~ '^[A-Za-z0-9-]{1,64}$'),
  name text not null check (length(trim(name)) > 0),
  split_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id)
);

-- Salários salvos de cada perfil (padrão para os próximos meses) ---------------------------------------------

create table if not exists public.workspace_salaries (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  workspace_id text not null,
  salary1 numeric(12, 2) not null default 0 check (salary1 >= 0),
  salary2 numeric(12, 2) not null default 0 check (salary2 >= 0),
  salary3 numeric(12, 2) not null default 0 check (salary3 >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, workspace_id)
);

-- Contas do mês -----------------------------------------------------------------------------------------------

create table if not exists public.fixed_bills (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  workspace_id text not null,
  month text not null check (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  name text not null,
  amount numeric(12, 2) not null,
  category text not null check (category in ('Moradia', 'Utilidades', 'Assinaturas', 'Transporte', 'Saúde', 'Outros')),
  payer text not null check (payer in ('salary1', 'salary2', 'salary3', 'split')),
  included_in_bill boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id)
);

create index if not exists fixed_bills_workspace_month_idx on public.fixed_bills (user_id, workspace_id, month);

-- Gastos avulsos (cartão de crédito), inclusive parcelas ----------------------------------------------------

create table if not exists public.spendings (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  workspace_id text not null,
  category text not null check (category in ('Carne', 'Gasolina', 'Mercado', 'Outros')),
  date date not null,
  amount numeric(12, 2) not null,
  note text not null default '',
  installment_group_id text,
  installment_number integer check (installment_number >= 1),
  installment_total integer check (installment_total >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id)
);

create index if not exists spendings_workspace_date_idx on public.spendings (user_id, workspace_id, date);
create index if not exists spendings_installment_group_idx on public.spendings (user_id, installment_group_id);

-- Divisões registradas ("Registrar divisão") ----------------------------------------------------------------

create table if not exists public.history_entries (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  workspace_id text not null,
  month text not null check (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  bill_amount numeric(12, 2) not null,
  salary1_payment numeric(12, 2) not null,
  salary2_payment numeric(12, 2) not null,
  salary3_payment numeric(12, 2) not null,
  calculated_at timestamptz not null default now(),
  deleted_at timestamptz,
  primary key (user_id, id)
);

create index if not exists history_entries_workspace_month_idx on public.history_entries (user_id, workspace_id, month);

-- Ajustes de cada mês (INSS, extra do pai, modo de divisão, estimativas por categoria) -----------------------

create table if not exists public.month_settings (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  workspace_id text not null,
  month text not null check (month ~ '^\d{4}-(0[1-9]|1[0-2])$'),
  inss numeric(12, 2) not null default 0 check (inss >= 0),
  extra_pai numeric(12, 2) not null default 0 check (extra_pai >= 0),
  split_mode text not null default 'equal' check (split_mode in ('equal', 'proportional')),
  budgets jsonb not null default '{}'::jsonb,
  primary key (user_id, workspace_id, month)
);

-- RLS: cada pessoa acessa só as próprias linhas ----------------------------------------------------------------

alter table public.workspaces enable row level security;
alter table public.workspace_salaries enable row level security;
alter table public.fixed_bills enable row level security;
alter table public.spendings enable row level security;
alter table public.history_entries enable row level security;
alter table public.month_settings enable row level security;

drop policy if exists "workspaces_own_rows" on public.workspaces;
create policy "workspaces_own_rows" on public.workspaces
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "workspace_salaries_own_rows" on public.workspace_salaries;
create policy "workspace_salaries_own_rows" on public.workspace_salaries
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "fixed_bills_own_rows" on public.fixed_bills;
create policy "fixed_bills_own_rows" on public.fixed_bills
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "spendings_own_rows" on public.spendings;
create policy "spendings_own_rows" on public.spendings
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "history_entries_own_rows" on public.history_entries;
create policy "history_entries_own_rows" on public.history_entries
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

drop policy if exists "month_settings_own_rows" on public.month_settings;
create policy "month_settings_own_rows" on public.month_settings
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

grant select, insert, update, delete on
  public.workspaces,
  public.workspace_salaries,
  public.fixed_bills,
  public.spendings,
  public.history_entries,
  public.month_settings
to authenticated;

-- Importar backup: substitui TUDO da pessoa logada, numa única transação ---------------------------------------
--
-- `security invoker`: roda com as permissões (e a RLS) de quem chama, então só toca nas linhas dela.
-- O payload usa os nomes das colunas (snake_case); veja `repositories/backup.repository.ts`.

create or replace function public.replace_all_data(payload jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  delete from public.history_entries where user_id = uid;
  delete from public.spendings where user_id = uid;
  delete from public.fixed_bills where user_id = uid;
  delete from public.month_settings where user_id = uid;
  delete from public.workspace_salaries where user_id = uid;
  delete from public.workspaces where user_id = uid;

  insert into public.workspaces (user_id, id, name, split_enabled, created_at, updated_at, deleted_at)
  select uid, r.id, r.name, r.split_enabled, r.created_at, r.updated_at, r.deleted_at
  from jsonb_to_recordset(coalesce(payload -> 'workspaces', '[]'::jsonb)) as r(
    id text, name text, split_enabled boolean, created_at timestamptz, updated_at timestamptz, deleted_at timestamptz
  );

  insert into public.workspace_salaries (user_id, workspace_id, salary1, salary2, salary3, created_at, updated_at)
  select uid, r.workspace_id, r.salary1, r.salary2, r.salary3, r.created_at, r.updated_at
  from jsonb_to_recordset(coalesce(payload -> 'workspace_salaries', '[]'::jsonb)) as r(
    workspace_id text, salary1 numeric, salary2 numeric, salary3 numeric, created_at timestamptz, updated_at timestamptz
  );

  insert into public.fixed_bills (
    user_id, id, workspace_id, month, name, amount, category, payer, included_in_bill, created_at, updated_at, deleted_at
  )
  select
    uid, r.id, r.workspace_id, r.month, r.name, r.amount, r.category, r.payer, r.included_in_bill,
    r.created_at, r.updated_at, r.deleted_at
  from jsonb_to_recordset(coalesce(payload -> 'fixed_bills', '[]'::jsonb)) as r(
    id text, workspace_id text, month text, name text, amount numeric, category text, payer text,
    included_in_bill boolean, created_at timestamptz, updated_at timestamptz, deleted_at timestamptz
  );

  insert into public.spendings (
    user_id, id, workspace_id, category, date, amount, note,
    installment_group_id, installment_number, installment_total, created_at, updated_at, deleted_at
  )
  select
    uid, r.id, r.workspace_id, r.category, r.date, r.amount, coalesce(r.note, ''),
    r.installment_group_id, r.installment_number, r.installment_total, r.created_at, r.updated_at, r.deleted_at
  from jsonb_to_recordset(coalesce(payload -> 'spendings', '[]'::jsonb)) as r(
    id text, workspace_id text, category text, date date, amount numeric, note text,
    installment_group_id text, installment_number integer, installment_total integer,
    created_at timestamptz, updated_at timestamptz, deleted_at timestamptz
  );

  insert into public.history_entries (
    user_id, id, workspace_id, month, bill_amount, salary1_payment, salary2_payment, salary3_payment,
    calculated_at, deleted_at
  )
  select
    uid, r.id, r.workspace_id, r.month, r.bill_amount, r.salary1_payment, r.salary2_payment, r.salary3_payment,
    r.calculated_at, r.deleted_at
  from jsonb_to_recordset(coalesce(payload -> 'history_entries', '[]'::jsonb)) as r(
    id text, workspace_id text, month text, bill_amount numeric, salary1_payment numeric,
    salary2_payment numeric, salary3_payment numeric, calculated_at timestamptz, deleted_at timestamptz
  );

  insert into public.month_settings (user_id, workspace_id, month, inss, extra_pai, split_mode, budgets)
  select uid, r.workspace_id, r.month, r.inss, r.extra_pai, r.split_mode, coalesce(r.budgets, '{}'::jsonb)
  from jsonb_to_recordset(coalesce(payload -> 'month_settings', '[]'::jsonb)) as r(
    workspace_id text, month text, inss numeric, extra_pai numeric, split_mode text, budgets jsonb
  );
end;
$$;

revoke all on function public.replace_all_data(jsonb) from public, anon;
grant execute on function public.replace_all_data(jsonb) to authenticated;
