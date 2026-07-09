-- Adds morning/afternoon shift start-end times to pj_cycle_days.
-- hours_worked is now derived from these times (see services/pj-math.service.ts:hoursWorkedFromTimes)
-- instead of being typed in directly. Run manually in the Supabase SQL editor.

alter table public.pj_cycle_days
  add column if not exists morning_start time,
  add column if not exists morning_end time,
  add column if not exists afternoon_start time,
  add column if not exists afternoon_end time;
