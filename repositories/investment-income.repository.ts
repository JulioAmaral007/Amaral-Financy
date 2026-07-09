import { assertNoError, unwrapList } from "@/lib/supabase/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CreateIncomeInput } from "@/schemas/investment.schema";
import type { InvestmentIncome } from "@/types/investment";

interface IncomeRow {
  id: string;
  received_at: string;
  source: string;
  amount: number;
  created_at: string;
}

const SELECT_COLUMNS = "id, received_at, source, amount, created_at";

function mapRow(row: IncomeRow): InvestmentIncome {
  return {
    id: row.id,
    receivedAt: row.received_at,
    source: row.source,
    amount: row.amount,
    createdAt: row.created_at,
  };
}

/** Proventos recebidos a partir de `sinceDate` (ISO date), do mais recente ao mais antigo. */
export async function listIncomes(
  userId: string,
  sinceDate: string,
  limit: number
): Promise<InvestmentIncome[]> {
  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from("investment_incomes")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .gte("received_at", sinceDate)
    .order("received_at", { ascending: false })
    .limit(limit)
    .returns<IncomeRow[]>();

  return unwrapList(result, "listIncomes").map(mapRow);
}

export async function createIncome(userId: string, input: CreateIncomeInput): Promise<InvestmentIncome> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("investment_incomes")
    .insert({
      user_id: userId,
      received_at: input.receivedAt,
      source: input.source,
      amount: input.amount,
    })
    .select(SELECT_COLUMNS)
    .single<IncomeRow>();

  if (error || !data) throw new Error(error?.message ?? "failed to create income");
  return mapRow(data);
}

export async function deleteIncome(userId: string, id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("investment_incomes").delete().eq("id", id).eq("user_id", userId);
  assertNoError(error, "deleteIncome");
}
