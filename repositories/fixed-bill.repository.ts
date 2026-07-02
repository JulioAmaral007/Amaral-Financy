import { STORAGE_KEYS } from "@/lib/local-storage/keys";
import { readStorage, writeStorage } from "@/lib/local-storage/storage";
import type { FixedBill, FixedBillCategory, FixedBillPayer } from "@/types/fixed-bill";

interface StoredFixedBill extends FixedBill {
  deletedAt: string | null;
}

function readAll(): StoredFixedBill[] {
  return readStorage<StoredFixedBill[]>(STORAGE_KEYS.FIXED_BILLS, []);
}

function writeAll(bills: StoredFixedBill[]): void {
  writeStorage(STORAGE_KEYS.FIXED_BILLS, bills);
}

function stripDeleted(bill: StoredFixedBill): FixedBill {
  return {
    id: bill.id,
    name: bill.name,
    amount: bill.amount,
    category: bill.category,
    payer: bill.payer,
    dueDay: bill.dueDay,
    isPaid: bill.isPaid,
    createdAt: bill.createdAt,
    updatedAt: bill.updatedAt,
  };
}

/**
 * Todas as contas fixas, sem paginação — usado para totais/alertas e para
 * a agregação por mês do Histórico, que precisam do conjunto completo.
 */
export async function listAllFixedBills(): Promise<FixedBill[]> {
  return readAll()
    .filter((bill) => !bill.deletedAt)
    .sort((a, b) => a.dueDay - b.dueDay)
    .map(stripDeleted);
}

export async function listFixedBillsPage(pagination: {
  limit: number;
  offset: number;
}): Promise<{ bills: FixedBill[]; total: number }> {
  const all = await listAllFixedBills();
  return {
    bills: all.slice(pagination.offset, pagination.offset + pagination.limit),
    total: all.length,
  };
}

export async function createFixedBill(input: {
  name: string;
  amount: number;
  category: FixedBillCategory;
  payer: FixedBillPayer;
  dueDay: number;
}): Promise<FixedBill> {
  const now = new Date().toISOString();
  const bill: StoredFixedBill = {
    id: crypto.randomUUID(),
    name: input.name,
    amount: input.amount,
    category: input.category,
    payer: input.payer,
    dueDay: input.dueDay,
    isPaid: false,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  writeAll([...readAll(), bill]);
  return stripDeleted(bill);
}

export async function toggleFixedBillPaid(id: string, isPaid: boolean): Promise<FixedBill> {
  const all = readAll();
  const index = all.findIndex((bill) => bill.id === id && !bill.deletedAt);
  if (index === -1) throw new Error("Conta fixa não encontrada");

  all[index] = { ...all[index], isPaid, updatedAt: new Date().toISOString() };
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
