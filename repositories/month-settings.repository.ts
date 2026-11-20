import { getActiveWorkspaceId } from "@/lib/active-workspace";
import { createBrowserSupabaseClient, requireUserId } from "@/lib/supabase/client";
import { assertNoError, unwrapMaybe } from "@/lib/supabase/errors";
import type { MonthKey, MonthSettings } from "@/types/month";

import { monthSettingsFromRow, monthSettingsToRow, type MonthSettingsRow } from "./rows";

const TABLE = "month_settings";

export async function getMonthSettings(month: MonthKey): Promise<MonthSettings | null> {
  const row = unwrapMaybe<MonthSettingsRow>(
    await createBrowserSupabaseClient()
      .from(TABLE)
      .select("*")
      .eq("workspace_id", getActiveWorkspaceId())
      .eq("month", month)
      .maybeSingle(),
    "Erro ao ler os ajustes do mês"
  );
  return row ? monthSettingsFromRow(row) : null;
}

/** Ajustes do mês mais recente anterior a `month` — base para um mês ainda sem ajustes próprios. */
export async function getLatestMonthSettingsBefore(month: MonthKey): Promise<MonthSettings | null> {
  const row = unwrapMaybe<MonthSettingsRow>(
    await createBrowserSupabaseClient()
      .from(TABLE)
      .select("*")
      .eq("workspace_id", getActiveWorkspaceId())
      .lt("month", month)
      .order("month", { ascending: false })
      .limit(1)
      .maybeSingle(),
    "Erro ao ler os ajustes do mês anterior"
  );
  return row ? monthSettingsFromRow(row) : null;
}

export async function saveMonthSettings(settings: MonthSettings): Promise<MonthSettings> {
  const userId = await requireUserId();
  const { error } = await createBrowserSupabaseClient()
    .from(TABLE)
    .upsert({ user_id: userId, ...monthSettingsToRow(getActiveWorkspaceId(), settings) }, { onConflict: "user_id,workspace_id,month" });
  assertNoError(error, "Erro ao salvar os ajustes do mês");
  return settings;
}
