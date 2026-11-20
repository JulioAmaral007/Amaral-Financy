import { getActiveWorkspaceId } from "@/lib/active-workspace";
import { addMonthsToDate, shiftMonth } from "@/lib/month";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { assertNoError, fetchAllPages, unwrapList, unwrapMaybe } from "@/lib/supabase/errors";
import { round2 } from "@/lib/utils";
import type { Spending, SpendingCategory } from "@/types/month";

import { spendingFromRow, spendingToRow, type SpendingRow, type StoredSpending } from "./rows";

const TABLE = "spendings";

function stripDeleted(spending: StoredSpending): Spending {
  return {
    id: spending.id,
    category: spending.category,
    date: spending.date,
    amount: spending.amount,
    note: spending.note,
    ...(spending.installment ? { installment: spending.installment } : {}),
    createdAt: spending.createdAt,
    updatedAt: spending.updatedAt,
  };
}

/** Todos os gastos de todos os meses — usado para a agregação anual do gráfico. */
export async function listAllSpendings(): Promise<Spending[]> {
  const workspaceId = getActiveWorkspaceId();
  const rows = await fetchAllPages<SpendingRow>(
    (from, to) =>
      createBrowserSupabaseClient()
        .from(TABLE)
        .select("*")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .order("date")
        .order("id")
        .range(from, to),
    "Erro ao listar os gastos"
  );
  return rows.map(spendingFromRow).map(stripDeleted);
}

/** Mais recentes primeiro (data e, no empate, ordem de criação). */
export async function listSpendingsForMonth(month: string): Promise<Spending[]> {
  const rows = unwrapList<SpendingRow>(
    await createBrowserSupabaseClient()
      .from(TABLE)
      .select("*")
      .eq("workspace_id", getActiveWorkspaceId())
      .gte("date", `${month}-01`)
      .lt("date", `${shiftMonth(month, 1)}-01`)
      .is("deleted_at", null)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false }),
    "Erro ao listar os gastos do mês"
  );
  return rows.map(spendingFromRow).map(stripDeleted);
}

async function insertSpendings(spendings: StoredSpending[]): Promise<void> {
  const workspaceId = getActiveWorkspaceId();
  const { error } = await createBrowserSupabaseClient()
    .from(TABLE)
    .insert(spendings.map((spending) => spendingToRow(workspaceId, spending)));
  assertNoError(error, "Erro ao salvar o gasto");
}

export async function createSpending(input: {
  category: SpendingCategory;
  date: string;
  amount: number;
  note: string;
}): Promise<Spending> {
  const now = new Date().toISOString();
  const spending: StoredSpending = {
    id: crypto.randomUUID(),
    category: input.category,
    date: input.date,
    amount: input.amount,
    note: input.note,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  await insertSpendings([spending]);
  return stripDeleted(spending);
}

/**
 * Compra parcelada: divide `amount` (total) em `installments` parcelas, uma por
 * mês a partir de `date`. A última parcela absorve a diferença de centavos.
 */
export async function createInstallmentSpendings(input: {
  category: SpendingCategory;
  date: string;
  amount: number;
  note: string;
  installments: number;
}): Promise<Spending[]> {
  const now = new Date().toISOString();
  const groupId = crypto.randomUUID();
  const base = round2(Math.floor(Math.round(input.amount * 100) / input.installments) / 100);

  const created: StoredSpending[] = Array.from({ length: input.installments }, (_, index) => {
    const isLast = index === input.installments - 1;
    return {
      id: crypto.randomUUID(),
      category: input.category,
      date: addMonthsToDate(input.date, index),
      amount: isLast ? round2(input.amount - base * (input.installments - 1)) : base,
      note: input.note,
      installment: { groupId, number: index + 1, total: input.installments },
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };
  });

  await insertSpendings(created);
  return created.map(stripDeleted);
}

export async function updateSpending(
  id: string,
  input: { category: SpendingCategory; date: string; amount: number; note: string }
): Promise<Spending> {
  const row = unwrapMaybe<SpendingRow>(
    await createBrowserSupabaseClient()
      .from(TABLE)
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .maybeSingle(),
    "Erro ao atualizar o gasto"
  );
  if (!row) throw new Error("Gasto não encontrado");
  return stripDeleted(spendingFromRow(row));
}

/** Soft delete: marca `deleted_at` em vez de remover a linha. */
export async function deleteSpending(id: string): Promise<void> {
  const { error } = await createBrowserSupabaseClient()
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);
  assertNoError(error, "Erro ao remover o gasto");
}

/**
 * Soft delete da parcela `fromNumber` e das seguintes da mesma compra.
 * Devolve os ids removidos (para o "Desfazer").
 */
export async function deleteInstallmentsFrom(groupId: string, fromNumber: number): Promise<string[]> {
  const rows = unwrapList<{ id: string }>(
    await createBrowserSupabaseClient()
      .from(TABLE)
      .update({ deleted_at: new Date().toISOString() })
      .eq("installment_group_id", groupId)
      .gte("installment_number", fromNumber)
      .is("deleted_at", null)
      .select("id"),
    "Erro ao remover as parcelas"
  );
  return rows.map((row) => row.id);
}

/** Reverte um soft delete: usado pelo "Desfazer" mostrado ao remover um gasto. */
export async function restoreSpendings(ids: string[]): Promise<void> {
  if (ids.length === 0) return;

  const { error } = await createBrowserSupabaseClient()
    .from(TABLE)
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .in("id", ids)
    .not("deleted_at", "is", null);
  assertNoError(error, "Erro ao restaurar o gasto");
}

export async function restoreSpending(id: string): Promise<void> {
  return restoreSpendings([id]);
}
