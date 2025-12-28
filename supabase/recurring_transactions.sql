-- ============================================
-- RECURRING TRANSACTIONS SCHEMA
-- ============================================
-- This file contains SQL commands to add 
-- recurring transactions support to Financy.
-- 
-- How to use:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste this entire file
-- 4. Click "Run" to execute
-- ============================================

-- ============================================
-- RECURRING TRANSACTIONS TABLE
-- ============================================
-- Stores templates for recurring transactions
-- Supports: daily, weekly, monthly, yearly frequencies
-- Also supports installments (parcelas)

create table if not exists public.recurring_transactions (
  id uuid default gen_random_uuid() not null primary key,
  
  -- Transaction details
  description text not null,
  amount decimal(12, 2) not null,
  type text not null check (type in ('income', 'expense')),
  category_id uuid references public.categories on delete set null,
  user_id uuid references auth.users on delete cascade not null,
  
  -- Recurrence settings
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  day_of_month integer check (day_of_month >= 1 and day_of_month <= 31), -- for monthly
  day_of_week integer check (day_of_week >= 0 and day_of_week <= 6),     -- for weekly (0=Sunday)
  
  -- Date range
  start_date date not null,
  end_date date,  -- null = no end (infinite)
  
  -- Installments (Parcelas)
  is_installment boolean default false,
  total_installments integer check (total_installments >= 1),  -- total number of parcelas
  current_installment integer default 1,                        -- current parcela number
  
  -- Status tracking
  is_active boolean default true,
  last_generated_date date,  -- last date a transaction was generated
  next_due_date date,        -- next date a transaction should be generated
  
  -- Metadata
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.recurring_transactions enable row level security;

-- Policies for recurring_transactions
create policy "Users can view their own recurring transactions" 
  on public.recurring_transactions for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own recurring transactions" 
  on public.recurring_transactions for insert 
  with check (auth.uid() = user_id);

create policy "Users can update their own recurring transactions" 
  on public.recurring_transactions for update 
  using (auth.uid() = user_id);

create policy "Users can delete their own recurring transactions" 
  on public.recurring_transactions for delete 
  using (auth.uid() = user_id);

-- Indexes for faster queries
create index if not exists recurring_transactions_user_id_idx on public.recurring_transactions (user_id);
create index if not exists recurring_transactions_category_id_idx on public.recurring_transactions (category_id);
create index if not exists recurring_transactions_next_due_date_idx on public.recurring_transactions (next_due_date);
create index if not exists recurring_transactions_is_active_idx on public.recurring_transactions (is_active);

-- Apply updated_at trigger
drop trigger if exists set_recurring_transactions_updated_at on public.recurring_transactions;
create trigger set_recurring_transactions_updated_at
  before update on public.recurring_transactions
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- ADD RECURRING REFERENCE TO TRANSACTIONS
-- ============================================
-- Links generated transactions back to their recurring source

alter table public.transactions 
  add column if not exists recurring_transaction_id uuid references public.recurring_transactions on delete set null;

alter table public.transactions 
  add column if not exists installment_number integer;

-- Index for faster queries
create index if not exists transactions_recurring_id_idx on public.transactions (recurring_transaction_id);

-- ============================================
-- FUNCTION: Generate Recurring Transactions
-- ============================================
-- This function generates transactions for all active recurring transactions
-- that are due. Call this function daily via a Supabase Edge Function or cron.

create or replace function public.generate_recurring_transactions()
returns integer as $$
declare
  rec record;
  generated_count integer := 0;
  next_date date;
begin
  -- Loop through all active recurring transactions that are due
  for rec in 
    select * from public.recurring_transactions 
    where is_active = true 
      and next_due_date is not null 
      and next_due_date <= current_date
      and (end_date is null or next_due_date <= end_date)
  loop
    -- For installments, check if we haven't exceeded total
    if rec.is_installment and rec.current_installment > rec.total_installments then
      -- Deactivate this recurring transaction
      update public.recurring_transactions 
      set is_active = false, updated_at = now()
      where id = rec.id;
      continue;
    end if;
    
    -- Generate the transaction
    insert into public.transactions (
      description,
      amount,
      type,
      date,
      category_id,
      user_id,
      recurring_transaction_id,
      installment_number
    ) values (
      case 
        when rec.is_installment then 
          rec.description || ' (' || rec.current_installment || '/' || rec.total_installments || ')'
        else 
          rec.description
      end,
      rec.amount,
      rec.type,
      rec.next_due_date,
      rec.category_id,
      rec.user_id,
      rec.id,
      case when rec.is_installment then rec.current_installment else null end
    );
    
    generated_count := generated_count + 1;
    
    -- Calculate next due date based on frequency
    case rec.frequency
      when 'daily' then
        next_date := rec.next_due_date + interval '1 day';
      when 'weekly' then
        next_date := rec.next_due_date + interval '1 week';
      when 'monthly' then
        -- Handle month-end edge cases
        next_date := (rec.next_due_date + interval '1 month')::date;
        -- If original day was 31 and new month has less days, adjust
        if rec.day_of_month is not null then
          next_date := make_date(
            extract(year from next_date)::integer,
            extract(month from next_date)::integer,
            least(rec.day_of_month, extract(day from (date_trunc('month', next_date) + interval '1 month - 1 day'))::integer)
          );
        end if;
      when 'yearly' then
        next_date := rec.next_due_date + interval '1 year';
    end case;
    
    -- Check if this is an installment and increment counter
    if rec.is_installment then
      update public.recurring_transactions 
      set 
        last_generated_date = rec.next_due_date,
        next_due_date = next_date,
        current_installment = rec.current_installment + 1,
        -- Deactivate if this was the last installment
        is_active = (rec.current_installment < rec.total_installments),
        updated_at = now()
      where id = rec.id;
    else
      -- Regular recurring transaction
      update public.recurring_transactions 
      set 
        last_generated_date = rec.next_due_date,
        next_due_date = next_date,
        -- Deactivate if we've passed the end date
        is_active = (rec.end_date is null or next_date <= rec.end_date),
        updated_at = now()
      where id = rec.id;
    end if;
  end loop;
  
  return generated_count;
end;
$$ language plpgsql security definer;

-- ============================================
-- FUNCTION: Generate Recurring for Single User
-- ============================================
-- Use this to generate pending transactions for a specific user
-- Good for calling when user logs in

create or replace function public.generate_user_recurring_transactions(p_user_id uuid)
returns integer as $$
declare
  rec record;
  generated_count integer := 0;
  next_date date;
begin
  -- Loop through all active recurring transactions for this user that are due
  for rec in 
    select * from public.recurring_transactions 
    where user_id = p_user_id
      and is_active = true 
      and next_due_date is not null 
      and next_due_date <= current_date
      and (end_date is null or next_due_date <= end_date)
  loop
    -- For installments, check if we haven't exceeded total
    if rec.is_installment and rec.current_installment > rec.total_installments then
      update public.recurring_transactions 
      set is_active = false, updated_at = now()
      where id = rec.id;
      continue;
    end if;
    
    -- Generate the transaction
    insert into public.transactions (
      description,
      amount,
      type,
      date,
      category_id,
      user_id,
      recurring_transaction_id,
      installment_number
    ) values (
      case 
        when rec.is_installment then 
          rec.description || ' (' || rec.current_installment || '/' || rec.total_installments || ')'
        else 
          rec.description
      end,
      rec.amount,
      rec.type,
      rec.next_due_date,
      rec.category_id,
      rec.user_id,
      rec.id,
      case when rec.is_installment then rec.current_installment else null end
    );
    
    generated_count := generated_count + 1;
    
    -- Calculate next due date
    case rec.frequency
      when 'daily' then
        next_date := rec.next_due_date + interval '1 day';
      when 'weekly' then
        next_date := rec.next_due_date + interval '1 week';
      when 'monthly' then
        next_date := (rec.next_due_date + interval '1 month')::date;
        if rec.day_of_month is not null then
          next_date := make_date(
            extract(year from next_date)::integer,
            extract(month from next_date)::integer,
            least(rec.day_of_month, extract(day from (date_trunc('month', next_date) + interval '1 month - 1 day'))::integer)
          );
        end if;
      when 'yearly' then
        next_date := rec.next_due_date + interval '1 year';
    end case;
    
    -- Update the recurring transaction
    if rec.is_installment then
      update public.recurring_transactions 
      set 
        last_generated_date = rec.next_due_date,
        next_due_date = next_date,
        current_installment = rec.current_installment + 1,
        is_active = (rec.current_installment < rec.total_installments),
        updated_at = now()
      where id = rec.id;
    else
      update public.recurring_transactions 
      set 
        last_generated_date = rec.next_due_date,
        next_due_date = next_date,
        is_active = (rec.end_date is null or next_date <= rec.end_date),
        updated_at = now()
      where id = rec.id;
    end if;
  end loop;
  
  return generated_count;
end;
$$ language plpgsql security definer;
