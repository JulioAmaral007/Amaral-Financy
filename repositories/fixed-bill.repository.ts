import { STORAGE_KEYS } from "@/lib/local-storage/keys";
import { readStorage, writeStorage } from "@/lib/local-storage/storage";
import { currentMonthKey } from "@/lib/month";
import type { FixedBill, FixedBillCategory, FixedBillPayer } from "@/types/fixed-bill";

interface StoredFixedBill extends Omit<FixedBill, "month"> {
  /** Ausente em contas criadas antes do controle por mês. */
  month?: string;
  deletedAt: string | null;
}

/**
 * Contas criadas antes do controle por mês não têm `month`: elas passam a
 * valer para o mês corrente na primeira leitura e a migração é gravada.
 */
function readAll(): Array<StoredFixedBill & { month: string }> {
  const stored = readStorage<StoredFixedBill[]>(STORAGE_KEYS.FIXED_BILLS, []);
  if (stored.every((bill) => bill.month)) return stored as Array<StoredFixedBill & { month: string }>;

  const fallbackMonth = currentMonthKey();
  const migrated = stored.map((bill) => ({ ...bill, month: bill.month ?? fallbackMonth }));
  writeStorage(STORAGE_KEYS.FIXED_BILLS, migrated);
  return migrated;
}

function writeAll(bills: StoredFixedBill[]): void {
  writeStorage(STORAGE_KEYS.FIXED_BILLS, bills);
}

function stripDeleted(bill: StoredFixedBill & { month: string }): FixedBill {
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
 * Todas as contas fixas de todos os meses, sem paginação — usado para a
 * agregação por mês do gráfico, que precisa do conjunto completo.
 */
export async function listAllFixedBills(): Promise<FixedBill[]> {
  return readAll()
    .filter((bill) => !bill.deletedAt)
    .map(stripDeleted);
}

export async function listFixedBillsForMonth(month: string): Promise<FixedBill[]> {
  return readAll()
    .filter((bill) => !bill.deletedAt && bill.month === month)
    .map(stripDeleted);
}

export async function createFixedBill(input: {
  month: string;
  name: string;
  amount: number;
  category: FixedBillCategory;
  payer: FixedBillPayer;
}): Promise<FixedBill> {
  const now = new Date().toISOString();
  const bill: StoredFixedBill & { month: string } = {
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

  writeAll([...readAll(), bill]);
  return stripDeleted(bill);
}

/** Duplica as contas de um mês para outro (novos ids), devolvendo quantas foram copiadas. */
export async function copyFixedBills(fromMonth: string, toMonth: string): Promise<number> {
  const all = readAll();
  const now = new Date().toISOString();

  const copies = all
    .filter((bill) => !bill.deletedAt && bill.month === fromMonth)
    .map((bill) => ({
      ...bill,
      id: crypto.randomUUID(),
      month: toMonth,
      createdAt: now,
      updatedAt: now,
    }));

  if (copies.length > 0) writeAll([...all, ...copies]);
  return copies.length;
}

export async function updateFixedBill(
  id: string,
  input: { name: string; amount: number; category: FixedBillCategory }
): Promise<FixedBill> {
  const all = readAll();
  const index = all.findIndex((bill) => bill.id === id && !bill.deletedAt);
  if (index === -1) throw new Error("Conta fixa não encontrada");

  all[index] = { ...all[index], ...input, updatedAt: new Date().toISOString() };
  writeAll(all);
  return stripDeleted(all[index]);
}

export async function toggleFixedBillIncluded(id: string, includedInBill: boolean): Promise<FixedBill> {
  const all = readAll();
  const index = all.findIndex((bill) => bill.id === id && !bill.deletedAt);
  if (index === -1) throw new Error("Conta fixa não encontrada");

  all[index] = { ...all[index], includedInBill, updatedAt: new Date().toISOString() };
  writeAll(all);
  return stripDeleted(all[index]);
}

/**
 * Soft delete: marca `deletedAt` em vez de remover o registro, preservando
 * o histórico/auditoria — mesmo comportamento da versão com Supabase.
 */
export async function deleteFixedBill(id: string): Promise<void> {
  const all = readAll();
  const index = all.findIndex((bill) => bill.id === id && !bill.deletedAt);
  if (index === -1) return;

  all[index] = { ...all[index], deletedAt: new Date().toISOString() };
  writeAll(all);
}

/** Reverte um soft delete: usado pelo "Desfazer" mostrado ao remover uma conta fixa. */
export async function restoreFixedBill(id: string): Promise<void> {
  const all = readAll();
  const index = all.findIndex((bill) => bill.id === id && bill.deletedAt);
  if (index === -1) return;

  all[index] = { ...all[index], deletedAt: null, updatedAt: new Date().toISOString() };
  writeAll(all);
}
