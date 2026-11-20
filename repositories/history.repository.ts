import { getActiveWorkspaceId } from "@/lib/active-workspace";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { assertNoError, unwrapMaybe } from "@/lib/supabase/errors";
import type { HistoryEntry } from "@/types/history";

import { historyEntryFromRow, historyEntryToRow, type HistoryEntryRow, type StoredHistoryEntry } from "./rows";

const TABLE = "history_entries";

function stripDeleted(entry: StoredHistoryEntry): HistoryEntry {
  return {
    id: entry.id,
    billAmount: entry.billAmount,
    salary1Payment: entry.salary1Payment,
    salary2Payment: entry.salary2Payment,
    salary3Payment: entry.salary3Payment,
    calculatedAt: entry.calculatedAt,
    month: entry.month,
  };
}

/** Divisões do mês, mais recentes primeiro, já paginadas pelo banco. */
export async function listHistoryPage(pagination: {
  limit: number;
  offset: number;
  month: string;
}): Promise<{ entries: HistoryEntry[]; total: number }> {
  const { data, count, error } = await createBrowserSupabaseClient()
    .from(TABLE)
    .select("*", { count: "exact" })
    .eq("workspace_id", getActiveWorkspaceId())
    .eq("month", pagination.month)
    .is("deleted_at", null)
    .order("calculated_at", { ascending: false })
    .range(pagination.offset, pagination.offset + pagination.limit - 1);
  assertNoError(error, "Erro ao listar o histórico");

  const rows = (data ?? []) as HistoryEntryRow[];
  return { entries: rows.map(historyEntryFromRow).map(stripDeleted), total: count ?? 0 };
}

export async function createHistoryEntry(input: {
  month: string;
  billAmount: number;
  salary1Payment: number;
  salary2Payment: number;
  salary3Payment: number;
}): Promise<HistoryEntry> {
  const entry: StoredHistoryEntry = {
    id: crypto.randomUUID(),
    billAmount: input.billAmount,
    salary1Payment: input.salary1Payment,
    salary2Payment: input.salary2Payment,
    salary3Payment: input.salary3Payment,
    calculatedAt: new Date().toISOString(),
    month: input.month,
    deletedAt: null,
  };

  const { error } = await createBrowserSupabaseClient()
    .from(TABLE)
    .insert(historyEntryToRow(getActiveWorkspaceId(), entry));
  assertNoError(error, "Erro ao registrar a divisão");
  return stripDeleted(entry);
}

export async function updateHistoryEntry(
  id: string,
  input: {
    billAmount: number;
    salary1Payment: number;
    salary2Payment: number;
    salary3Payment: number;
  }
): Promise<HistoryEntry> {
  const row = unwrapMaybe<HistoryEntryRow>(
    await createBrowserSupabaseClient()
      .from(TABLE)
      .update({
        bill_amount: input.billAmount,
        salary1_payment: input.salary1Payment,
        salary2_payment: input.salary2Payment,
        salary3_payment: input.salary3Payment,
      })
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .maybeSingle(),
    "Erro ao atualizar o cálculo"
  );
  if (!row) throw new Error("Cálculo não encontrado");
  return stripDeleted(historyEntryFromRow(row));
}

/**
 * Soft delete: marca `deleted_at` em vez de remover a linha, preservando
 * o histórico/auditoria — mesmo padrão utilizado em contas fixas.
 */
export async function deleteHistoryEntry(id: string): Promise<void> {
  const { error } = await createBrowserSupabaseClient()
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);
  assertNoError(error, "Erro ao remover o cálculo");
}

/** Reverte um soft delete: usado pelo "Desfazer" mostrado ao remover um cálculo. */
export async function restoreHistoryEntry(id: string): Promise<void> {
  const { error } = await createBrowserSupabaseClient()
    .from(TABLE)
    .update({ deleted_at: null })
    .eq("id", id)
    .not("deleted_at", "is", null);
  assertNoError(error, "Erro ao restaurar o cálculo");
}
