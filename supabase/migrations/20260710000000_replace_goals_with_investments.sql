-- Substitui a feature de metas (goals) pela carteira de investimentos.
-- Rode manualmente no SQL editor do Supabase, depois de
-- 20260709000000_drop_pj_cycle_day_note.sql.

drop table if exists public.goals;

-- ============================================
-- INVESTMENT ASSETS
-- ============================================

create table public.investment_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ticker text not null,
  name text not null,
  asset_class text not null check (asset_class in ('acao', 'fii', 'renda_fixa', 'internacional', 'cripto')),
  quantity numeric(18, 6) not null check (quantity > 0),
  avg_price numeric(14, 2) not null default 0,
  current_price numeric(14, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, ticker)
);

create index investment_assets_user_id_idx on public.investment_assets (user_id);

alter table public.investment_assets enable row level security;

create policy investment_assets_select_own on public.investment_assets for select using (auth.uid() = user_id);
create policy investment_assets_insert_own on public.investment_assets for insert with check (auth.uid() = user_id);
create policy investment_assets_update_own on public.investment_assets for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy investment_assets_delete_own on public.investment_assets for delete using (auth.uid() = user_id);

drop trigger if exists investment_assets_set_updated_at on public.investment_assets;
create trigger investment_assets_set_updated_at
  before update on public.investment_assets
  for each row execute procedure public.set_updated_at();

-- ============================================
-- INVESTMENT SETTINGS
-- ============================================
-- Uma linha por usuário: perfil de investidor (define a alocação-alvo) e os
-- parâmetros da reserva de emergência.

create table public.investment_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  investor_profile text not null default 'moderado' check (investor_profile in ('conservador', 'moderado', 'arrojado')),
  reserve_monthly_cost numeric(14, 2) not null default 0,
  reserve_target_months smallint not null default 6 check (reserve_target_months between 1 and 60),
  ipca_annual_rate numeric(6, 2) not null default 4.50,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.investment_settings enable row level security;

create policy investment_settings_select_own on public.investment_settings for select using (auth.uid() = user_id);
create policy investment_settings_insert_own on public.investment_settings for insert with check (auth.uid() = user_id);
create policy investment_settings_update_own on public.investment_settings for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists investment_settings_set_updated_at on public.investment_settings;
create trigger investment_settings_set_updated_at
  before update on public.investment_settings
  for each row execute procedure public.set_updated_at();

-- ============================================
-- INVESTMENT SNAPSHOTS
-- ============================================
-- Fotografia mensal da carteira, gravada pelo serviço a cada mutação de ativo.
-- total_cost é a base de custo; a variação dela entre dois meses é o aporte do
-- período, e o resto da variação de total_value é rentabilidade.

create table public.investment_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  month date not null,
  total_value numeric(16, 2) not null default 0,
  total_cost numeric(16, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month)
);

create index investment_snapshots_user_id_month_idx on public.investment_snapshots (user_id, month);

alter table public.investment_snapshots enable row level security;

create policy investment_snapshots_select_own on public.investment_snapshots for select using (auth.uid() = user_id);
create policy investment_snapshots_insert_own on public.investment_snapshots for insert with check (auth.uid() = user_id);
create policy investment_snapshots_update_own on public.investment_snapshots for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop trigger if exists investment_snapshots_set_updated_at on public.investment_snapshots;
create trigger investment_snapshots_set_updated_at
  before update on public.investment_snapshots
  for each row execute procedure public.set_updated_at();

-- ============================================
-- INVESTMENT INCOMES (proventos)
-- ============================================

create table public.investment_incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  received_at date not null,
  source text not null,
  amount numeric(14, 2) not null check (amount > 0),
  created_at timestamptz not null default now()
);

create index investment_incomes_user_id_received_at_idx on public.investment_incomes (user_id, received_at desc);

alter table public.investment_incomes enable row level security;

create policy investment_incomes_select_own on public.investment_incomes for select using (auth.uid() = user_id);
create policy investment_incomes_insert_own on public.investment_incomes for insert with check (auth.uid() = user_id);
create policy investment_incomes_delete_own on public.investment_incomes for delete using (auth.uid() = user_id);
