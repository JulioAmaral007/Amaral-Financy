import { getActiveWorkspaceId } from "@/lib/active-workspace";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { assertNoError, fetchAllPages, unwrapList, unwrapMaybe } from "@/lib/supabase/errors";
import type { FixedBill, FixedBillCategory, FixedBillPayer } from "@/types/fixed-bill";

import { fixedBillFromRow, fixedBillToRow, type FixedBillRow, type StoredFixedBill } from "./rows";

const TABLE = "fixed_bills";

function stripDeleted(bill: StoredFixedBill): FixedBill {
  return {
    id: bill.id,
    name: bill.name,
    amount: bill.amount,
    category: bill.category,
    payer: bill.payer,
    includedInBill: bill.includedInBill,
    month: bill.month,
    createdAt: bill.createdAt,
    updatedAt: bill.updatedAt,
  };
}

/**
 * Todas as contas fixas de todos os meses, sem paginação de tela — usado para a
 * agregação por mês do gráfico, que precisa do conjunto completo.
 */
export async function listAllFixedBills(): Promise<FixedBill[]> {
  const workspaceId = getActiveWorkspaceId();
  const rows = await fetchAllPages<FixedBillRow>(
    (from, to) =>
      createBrowserSupabaseClient()
        .from(TABLE)
        .select("*")
        .eq("workspace_id", workspaceId)
        .is("deleted_at", null)
        .order("created_at")
        .order("id")
        .range(from, to),
    "Erro ao listar as contas"
  );
  return rows.map(fixedBillFromRow).map(stripDeleted);
}

export async function listFixedBillsForMonth(month: string): Promise<FixedBill[]> {
  const rows = unwrapList<FixedBillRow>(
    await createBrowserSupabaseClient()
      .from(TABLE)
      .select("*")
      .eq("workspace_id", getActiveWorkspaceId())
      .eq("month", month)
      .is("deleted_at", null)
      .order("created_at")
      .order("id"),
    "Erro ao listar as contas do mês"
  );
  return rows.map(fixedBillFromRow).map(stripDeleted);
}

export async function createFixedBill(input: {
  month: string;
  name: string;
  amount: number;
  category: FixedBillCategory;
  payer: FixedBillPayer;
}): Promise<FixedBill> {
  const now = new Date().toISOString();
  const bill: StoredFixedBill = {
    id: crypto.randomUUID(),
    month: input.month,
    name: input.name,
    amount: input.amount,
    category: input.category,
    payer: input.payer,
    // Como na planilha, toda conta nova entra na soma do mês.
    includedInBill: true,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const { error } = await createBrowserSupabaseClient()
    .from(TABLE)
    .insert(fixedBillToRow(getActiveWorkspaceId(), bill));
  assertNoError(error, "Erro ao criar a conta");
  return stripDeleted(bill);
}

/** Duplica as contas de um mês para outro (novos ids), devolvendo quantas foram copiadas. */
export async function copyFixedBills(fromMonth: string, toMonth: string): Promise<number> {
  const workspaceId = getActiveWorkspaceId();
  const supabase = createBrowserSupabaseClient();
  const now = new Date().toISOString();

  const source = unwrapList<FixedBillRow>(
    await supabase
      .from(TABLE)
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("month", fromMonth)
      .is("deleted_at", null)
      .order("created_at")
      .order("id"),
    "Erro ao ler as contas do mês anterior"
  );

  const copies = source.map(fixedBillFromRow).map((bill) =>
    fixedBillToRow(workspaceId, {
      ...bill,
      id: crypto.randomUUID(),
      month: toMonth,
      createdAt: now,
      updatedAt: now,
    })
  );

  if (copies.length === 0) return 0;

  const { error } = await supabase.from(TABLE).insert(copies);
  assertNoError(error, "Erro ao copiar as contas");
  return copies.length;
}

async function updateActiveRow(id: string, patch: Record<string, unknown>): Promise<FixedBill> {
  const row = unwrapMaybe<FixedBillRow>(
    await createBrowserSupabaseClient()
      .from(TABLE)
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .maybeSingle(),
    "Erro ao atualizar a conta"
  );
  if (!row) throw new Error("Conta fixa não encontrada");
  return stripDeleted(fixedBillFromRow(row));
}

export async function updateFixedBill(
  id: string,
  input: { name: string; amount: number; category: FixedBillCategory }
): Promise<FixedBill> {
  return updateActiveRow(id, input);
}

export async function toggleFixedBillIncluded(id: string, includedInBill: boolean): Promise<FixedBill> {
  return updateActiveRow(id, { included_in_bill: includedInBill });
}

/**
 * Soft delete: marca `deleted_at` em vez de remover a linha, preservando
 * o histórico/auditoria.
 */
export async function deleteFixedBill(id: string): Promise<void> {
  const { error } = await createBrowserSupabaseClient()
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);
  assertNoError(error, "Erro ao remover a conta");
}

/** Reverte um soft delete: usado pelo "Desfazer" mostrado ao remover uma conta fixa. */
export async function restoreFixedBill(id: string): Promise<void> {
  const { error } = await createBrowserSupabaseClient()
    .from(TABLE)
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .not("deleted_at", "is", null);
  assertNoError(error, "Erro ao restaurar a conta");
}
