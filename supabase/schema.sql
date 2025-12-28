-- ============================================
-- FINANCY DATABASE SCHEMA
-- ============================================
-- This file contains all SQL commands to set up 
-- the Supabase database for the Financy application.
-- 
-- How to use:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
-- ============================================

-- ============================================
-- PROFILES TABLE
-- ============================================
-- Stores user profile information
-- Automatically created when a new user signs up

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile" 
  on public.profiles for select 
  using (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update 
  using (auth.uid() = id);

create policy "Users can insert their own profile" 
  on public.profiles for insert 
  with check (auth.uid() = id);

-- Function to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- CATEGORIES TABLE
-- ============================================
-- Stores transaction categories for users

create table if not exists public.categories (
  id uuid default gen_random_uuid() not null primary key,
  name text not null,
  description text,
  icon text not null default 'Wallet',
  color text not null default 'green',
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.categories enable row level security;

-- Policies for categories
create policy "Users can view their own categories" 
  on public.categories for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own categories" 
  on public.categories for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own categories" 
  on public.categories for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own categories" 
  on public.categories for delete 
  using (auth.uid() = user_id);

-- Index for faster queries
create index if not exists categories_user_id_idx on public.categories (user_id);

-- ============================================
-- TRANSACTIONS TABLE
-- ============================================
-- Stores financial transactions for users

create table if not exists public.transactions (
  id uuid default gen_random_uuid() not null primary key,
  description text not null,
  amount decimal(12, 2) not null,
  type text not null check (type in ('income', 'expense')),
  date date not null default current_date,
  category_id uuid references public.categories on delete set null,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.transactions enable row level security;

-- Policies for transactions
create policy "Users can view their own transactions" 
  on public.transactions for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own transactions" 
  on public.transactions for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own transactions" 
  on public.transactions for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own transactions" 
  on public.transactions for delete 
  using (auth.uid() = user_id);

-- Indexes for faster queries
create index if not exists transactions_user_id_idx on public.transactions (user_id);
create index if not exists transactions_category_id_idx on public.transactions (category_id);
create index if not exists transactions_date_idx on public.transactions (date desc);
create index if not exists transactions_type_idx on public.transactions (type);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
-- Automatically updates the updated_at column

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to all tables
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
  before update on public.categories
  for each row execute procedure public.handle_updated_at();

drop trigger if exists set_transactions_updated_at on public.transactions;
create trigger set_transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- DEFAULT CATEGORIES FUNCTION
-- ============================================
-- Creates default categories when a new user signs up

create or replace function public.create_default_categories()
returns trigger as $$
begin
  -- Insert default categories for the new user
  insert into public.categories (name, description, icon, color, user_id) values
    ('Alimentação', 'Restaurantes, delivery e refeições', 'Utensils', 'yellow', new.id),
    ('Entretenimento', 'Cinema, jogos e lazer', 'Gamepad2', 'pink', new.id),
    ('Investimento', 'Aplicações e retornos financeiros', 'TrendingUp', 'green', new.id),
    ('Mercado', 'Compras de supermercado e mantimentos', 'ShoppingCart', 'yellow', new.id),
    ('Salário', 'Renda mensal e bonificações', 'Wallet', 'green', new.id),
    ('Saúde', 'Medicamentos, consultas e exames', 'Heart', 'pink', new.id),
    ('Transporte', 'Gasolina, transporte público e viagens', 'Car', 'blue', new.id),
    ('Utilidades', 'Energia, água, internet e telefone', 'Home', 'yellow', new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create default categories on signup
drop trigger if exists on_auth_user_created_categories on auth.users;
create trigger on_auth_user_created_categories
  after insert on auth.users
  for each row execute procedure public.create_default_categories();
