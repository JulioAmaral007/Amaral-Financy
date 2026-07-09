-- Removes the free-text "observação" (note) column from pj_cycle_days.
-- The note field was dropped from the PJ folha de ponto UI, so it is no longer
-- read or written by the app. Run manually in the Supabase SQL editor.

alter table public.pj_cycle_days
  drop column if exists note;
