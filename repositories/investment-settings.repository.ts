import { assertNoError, unwrapMaybe } from "@/lib/supabase/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { UpdateInvestmentSettingsInput } from "@/schemas/investment.schema";
import type { InvestmentSettings } from "@/types/investment";

interface SettingsRow {
  investor_profile: string;
  reserve_monthly_cost: number;
  reserve_target_months: number;
  ipca_annual_rate: number;
}

const SELECT_COLUMNS = "investor_profile, reserve_monthly_cost, reserve_target_months, ipca_annual_rate";

function mapRow(row: SettingsRow): InvestmentSettings {
  return {
    investorProfile: row.investor_profile as InvestmentSettings["investorProfile"],
    reserveMonthlyCost: row.reserve_monthly_cost,
    reserveTargetMonths: row.reserve_target_months,
    ipcaAnnualRate: row.ipca_annual_rate,
  };
}

export async function getSettings(userId: string): Promise<InvestmentSettings | null> {
  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from("investment_settings")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle<SettingsRow>();

  const row = unwrapMaybe(result, "getSettings");
  return row ? mapRow(row) : null;
}

export async function upsertSettings(
  userId: string,
  input: UpdateInvestmentSettingsInput
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("investment_settings").upsert(
    {
      user_id: userId,
      investor_profile: input.investorProfile,
      reserve_monthly_cost: input.reserveMonthlyCost,
      reserve_target_months: input.reserveTargetMonths,
    },
    { onConflict: "user_id" }
  );

  assertNoError(error, "upsertSettings");
}
