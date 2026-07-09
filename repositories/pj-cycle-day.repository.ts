import { assertNoError, unwrapList } from "@/lib/supabase/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PjCycleDay } from "@/types/pj";

interface PjCycleDayRow {
  id: string;
  cycle_id: string;
  date: string;
  done: boolean;
  hours_worked: number | null;
  note: string;
  morning_start: string | null;
  morning_end: string | null;
  afternoon_start: string | null;
  afternoon_end: string | null;
}

const SELECT_COLUMNS =
  "id, cycle_id, date, done, hours_worked, note, morning_start, morning_end, afternoon_start, afternoon_end";

function mapRow(row: PjCycleDayRow): PjCycleDay {
  return {
    id: row.id,
    cycleId: row.cycle_id,
    date: row.date,
    done: row.done,
    hoursWorked: row.hours_worked,
    note: row.note,
    morningStart: row.morning_start,
    morningEnd: row.morning_end,
    afternoonStart: row.afternoon_start,
    afternoonEnd: row.afternoon_end,
  };
}

export async function listDays(cycleId: string): Promise<PjCycleDay[]> {
  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from("pj_cycle_days")
    .select(SELECT_COLUMNS)
    .eq("cycle_id", cycleId)
    .order("date", { ascending: true })
    .returns<PjCycleDayRow[]>();

  return unwrapList(result, "listDays").map(mapRow);
}

export async function insertDays(cycleId: string, userId: string, dates: string[]): Promise<void> {
  if (dates.length === 0) return;
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("pj_cycle_days").insert(
    dates.map((date) => ({ cycle_id: cycleId, user_id: userId, date }))
  );
  assertNoError(error, "insertDays");
}

export async function deleteDays(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("pj_cycle_days").delete().in("id", ids);
  assertNoError(error, "deleteDays");
}

export async function updateDay(
  userId: string,
  dayId: string,
  patch: {
    done?: boolean;
    hoursWorked?: number | null;
    note?: string;
    morningStart?: string | null;
    morningEnd?: string | null;
    afternoonStart?: string | null;
    afternoonEnd?: string | null;
  }
): Promise<PjCycleDay> {
  const supabase = await createServerSupabaseClient();
  const rowPatch: Record<string, unknown> = {};
  if (patch.done !== undefined) rowPatch.done = patch.done;
  if (patch.hoursWorked !== undefined) rowPatch.hours_worked = patch.hoursWorked;
  if (patch.note !== undefined) rowPatch.note = patch.note;
  if (patch.morningStart !== undefined) rowPatch.morning_start = patch.morningStart;
  if (patch.morningEnd !== undefined) rowPatch.morning_end = patch.morningEnd;
  if (patch.afternoonStart !== undefined) rowPatch.afternoon_start = patch.afternoonStart;
  if (patch.afternoonEnd !== undefined) rowPatch.afternoon_end = patch.afternoonEnd;

  const { data, error } = await supabase
    .from("pj_cycle_days")
    .update(rowPatch)
    .eq("id", dayId)
    .eq("user_id", userId)
    .select(SELECT_COLUMNS)
    .single<PjCycleDayRow>();

  if (error || !data) throw new Error(error?.message ?? "failed to update pj cycle day");
  return mapRow(data);
}
