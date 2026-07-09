import { assertNoError, unwrapList, unwrapMaybe } from "@/lib/supabase/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PjCycleConfig, PjCycle, PjCycleStatus } from "@/types/pj";

interface PjCycleRow {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  hourly_rate: number;
  journey_mode: string;
  journey_custom_hours: number | null;
  weekday_preset: string;
  custom_weekdays: number[];
  archived_at: string | null;
  predicted_hours: number | null;
  worked_hours: number | null;
  predicted_value: number | null;
  received_value: number | null;
  created_at: string;
  updated_at: string;
}

const SELECT_COLUMNS =
  "id, status, start_date, end_date, hourly_rate, journey_mode, journey_custom_hours, weekday_preset, custom_weekdays, archived_at, predicted_hours, worked_hours, predicted_value, received_value, created_at, updated_at";

function mapRow(row: PjCycleRow): PjCycle {
  return {
    id: row.id,
    status: row.status as PjCycleStatus,
    startDate: row.start_date,
    endDate: row.end_date,
    hourlyRate: row.hourly_rate,
    journeyMode: row.journey_mode as PjCycle["journeyMode"],
    journeyCustomHours: row.journey_custom_hours,
    weekdayPreset: row.weekday_preset as PjCycle["weekdayPreset"],
    customWeekdays: row.custom_weekdays,
    archivedAt: row.archived_at,
    predictedHours: row.predicted_hours,
    workedHours: row.worked_hours,
    predictedValue: row.predicted_value,
    receivedValue: row.received_value,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toConfigRowInput(config: PjCycleConfig) {
  return {
    start_date: config.startDate,
    end_date: config.endDate,
    hourly_rate: config.hourlyRate,
    journey_mode: config.journeyMode,
    journey_custom_hours: config.journeyCustomHours,
    weekday_preset: config.weekdayPreset,
    custom_weekdays: config.customWeekdays,
  };
}

export async function getActiveCycle(userId: string): Promise<PjCycle | null> {
  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from("pj_cycles")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle<PjCycleRow>();

  const data = unwrapMaybe(result, "getActiveCycle");
  return data ? mapRow(data) : null;
}

export async function listArchivedCycles(userId: string): Promise<PjCycle[]> {
  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from("pj_cycles")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .eq("status", "archived")
    .order("end_date", { ascending: false })
    .returns<PjCycleRow[]>();

  return unwrapList(result, "listArchivedCycles").map(mapRow);
}

export async function getCycleById(userId: string, id: string): Promise<PjCycle | null> {
  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from("pj_cycles")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle<PjCycleRow>();

  const data = unwrapMaybe(result, "getCycleById");
  return data ? mapRow(data) : null;
}

export async function createCycle(userId: string, config: PjCycleConfig): Promise<PjCycle> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("pj_cycles")
    .insert({ user_id: userId, status: "active", ...toConfigRowInput(config) })
    .select(SELECT_COLUMNS)
    .single<PjCycleRow>();

  if (error || !data) throw new Error(error?.message ?? "failed to create pj cycle");
  return mapRow(data);
}

export async function updateCycleConfig(
  userId: string,
  cycleId: string,
  config: PjCycleConfig
): Promise<PjCycle> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("pj_cycles")
    .update(toConfigRowInput(config))
    .eq("id", cycleId)
    .eq("user_id", userId)
    .select(SELECT_COLUMNS)
    .single<PjCycleRow>();

  if (error || !data) throw new Error(error?.message ?? "failed to update pj cycle");
  return mapRow(data);
}

export async function archiveCycle(
  userId: string,
  cycleId: string,
  snapshot: { predictedHours: number; workedHours: number; predictedValue: number; receivedValue: number }
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("pj_cycles")
    .update({
      status: "archived",
      archived_at: new Date().toISOString(),
      predicted_hours: snapshot.predictedHours,
      worked_hours: snapshot.workedHours,
      predicted_value: snapshot.predictedValue,
      received_value: snapshot.receivedValue,
    })
    .eq("id", cycleId)
    .eq("user_id", userId);

  assertNoError(error, "archiveCycle");
}
