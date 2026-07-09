-- Adds cdi_base_rate to profiles, and creates goals + PJ cycle tracking tables.
-- Run this manually in the Supabase SQL editor, after 20260706000000_create_profiles.sql.

alter table public.profiles
  add column if not exists cdi_base_rate numeric(6, 2) not null default 10.65;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================
-- GOALS
-- ============================================

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text not null default '',
  category text not null,
  target_value numeric(14, 2) not null,
  current_value numeric(14, 2) not null default 0,
  initial_contribution numeric(14, 2) not null default 0,
  monthly_contribution numeric(14, 2) not null default 0,
  start_date date not null,
  rate_mode text not null check (rate_mode in ('cdi', 'fixed')),
  cdi_percent numeric(6, 2) not null default 100,
  fixed_annual_rate numeric(6, 2) not null default 12,
  priority text not null check (priority in ('alta', 'media', 'baixa')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index goals_user_id_idx on public.goals (user_id);

alter table public.goals enable row level security;

create policy goals_select_own on public.goals for select using (auth.uid() = user_id);
create policy goals_insert_own on public.goals for insert with check (auth.uid() = user_id);
create policy goals_update_own on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy goals_delete_own on public.goals for delete using (auth.uid() = user_id);

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at
  before update on public.goals
  for each row execute procedure public.set_updated_at();

-- ============================================
-- PJ CYCLES
-- ============================================

create table public.pj_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'archived')),
  start_date date not null,
  end_date date not null,
  hourly_rate numeric(10, 2) not null,
  journey_mode text not null check (journey_mode in ('h4', 'h8', 'custom')),
  journey_custom_hours numeric(5, 2),
  weekday_preset text not null check (weekday_preset in ('segsex', 'segsab', 'custom')),
  custom_weekdays smallint[] not null default '{}',
  archived_at timestamptz,
  predicted_hours numeric(10, 2),
  worked_hours numeric(10, 2),
  predicted_value numeric(14, 2),
  received_value numeric(14, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enforce exactly one active cycle per user at the database level.
create unique index pj_cycles_one_active_per_user on public.pj_cycles (user_id) where status = 'active';
create index pj_cycles_user_id_idx on public.pj_cycles (user_id);

alter table public.pj_cycles enable row level security;

create policy pj_cycles_select_own on public.pj_cycles for select using (auth.uid() = user_id);
create policy pj_cycles_insert_own on public.pj_cycles for insert with check (auth.uid() = user_id);
create policy pj_cycles_update_own on public.pj_cycles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy pj_cycles_delete_own on public.pj_cycles for delete using (auth.uid() = user_id);

drop trigger if exists pj_cycles_set_updated_at on public.pj_cycles;
create trigger pj_cycles_set_updated_at
  before update on public.pj_cycles
  for each row execute procedure public.set_updated_at();

-- ============================================
-- PJ CYCLE DAYS
-- ============================================
-- Relational child table (not a jsonb array) so each day can be queried/
-- indexed/RLS-checked directly. user_id is denormalized from the parent
-- cycle purely so RLS policies here are a plain column check instead of
-- a subquery against pj_cycles on every row.

create table public.pj_cycle_days (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.pj_cycles (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  done boolean not null default false,
  hours_worked numeric(5, 2),
  note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cycle_id, date)
);

create index pj_cycle_days_cycle_id_idx on public.pj_cycle_days (cycle_id);
create index pj_cycle_days_user_id_idx on public.pj_cycle_days (user_id);

alter table public.pj_cycle_days enable row level security;

create policy pj_cycle_days_select_own on public.pj_cycle_days for select using (auth.uid() = user_id);
create policy pj_cycle_days_insert_own on public.pj_cycle_days for insert with check (auth.uid() = user_id);
create policy pj_cycle_days_update_own on public.pj_cycle_days for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy pj_cycle_days_delete_own on public.pj_cycle_days for delete using (auth.uid() = user_id);

drop trigger if exists pj_cycle_days_set_updated_at on public.pj_cycle_days;
create trigger pj_cycle_days_set_updated_at
  before update on public.pj_cycle_days
  for each row execute procedure public.set_updated_at();
