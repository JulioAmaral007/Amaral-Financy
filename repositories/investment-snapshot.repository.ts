import { assertNoError, unwrapList } from "@/lib/supabase/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { InvestmentSnapshot } from "@/types/investment";

interface SnapshotRow {
  month: string;
  total_value: number;
  total_cost: number;
}

const SELECT_COLUMNS = "month, total_value, total_cost";

function mapRow(row: SnapshotRow): InvestmentSnapshot {
  return { month: row.month, totalValue: row.total_value, totalCost: row.total_cost };
}

/**
 * Todos os snapshots do usuário em ordem cronológica. A tabela guarda no máximo
 * uma linha por mês, então a série inteira cabe numa consulta — e ela precisa
 * começar do primeiro mês para que o aporte inicial não seja perdido.
 */
export async function listSnapshots(userId: string): Promise<InvestmentSnapshot[]> {
  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from("investment_snapshots")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .order("month", { ascending: true })
    .returns<SnapshotRow[]>();

  return unwrapList(result, "listSnapshots").map(mapRow);
}

export async function upsertSnapshot(
  userId: string,
  month: string,
  totalValue: number,
  totalCost: number
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("investment_snapshots")
    .upsert(
      { user_id: userId, month, total_value: totalValue, total_cost: totalCost },
      { onConflict: "user_id,month" }
    );

  assertNoError(error, "upsertSnapshot");
}
