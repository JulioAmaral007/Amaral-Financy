import { STORAGE_KEYS } from "@/lib/local-storage/keys";
import { readStorage, writeStorage } from "@/lib/local-storage/storage";
import { monthKeyFromDate } from "@/lib/month";
import type { Spending, SpendingCategory } from "@/types/month";

interface StoredSpending extends Spending {
  deletedAt: string | null;
}

function readAll(): StoredSpending[] {
  return readStorage<StoredSpending[]>(STORAGE_KEYS.SPENDINGS, []);
}

function writeAll(spendings: StoredSpending[]): void {
  writeStorage(STORAGE_KEYS.SPENDINGS, spendings);
}

function stripDeleted(spending: StoredSpending): Spending {
  return {
    id: spending.id,
    category: spending.category,
    date: spending.date,
    amount: spending.amount,
    note: spending.note,
    createdAt: spending.createdAt,
    updatedAt: spending.updatedAt,
  };
}

/** Mais recentes primeiro (data e, no empate, ordem de criação). */
function sortByDateDesc(spendings: Spending[]): Spending[] {
  return [...spendings].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)
  );
}

/** Todos os gastos de todos os meses — usado para a agregação anual do gráfico. */
export async function listAllSpendings(): Promise<Spending[]> {
  return readAll()
    .filter((spending) => !spending.deletedAt)
    .map(stripDeleted);
}

export async function listSpendingsForMonth(month: string): Promise<Spending[]> {
  return sortByDateDesc(
    readAll()
      .filter((spending) => !spending.deletedAt && monthKeyFromDate(spending.date) === month)
      .map(stripDeleted)
  );
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

  writeAll([...readAll(), spending]);
  return stripDeleted(spending);
}

export async function updateSpending(
  id: string,
  input: { category: SpendingCategory; date: string; amount: number; note: string }
): Promise<Spending> {
  const all = readAll();
  const index = all.findIndex((spending) => spending.id === id && !spending.deletedAt);
  if (index === -1) throw new Error("Gasto não encontrado");

  all[index] = { ...all[index], ...input, updatedAt: new Date().toISOString() };
  writeAll(all);
  return stripDeleted(all[index]);
}

/** Soft delete: marca `deletedAt` em vez de remover o registro. */
export async function deleteSpending(id: string): Promise<void> {
  const all = readAll();
  const index = all.findIndex((spending) => spending.id === id && !spending.deletedAt);
  if (index === -1) return;

  all[index] = { ...all[index], deletedAt: new Date().toISOString() };
  writeAll(all);
}

/** Reverte um soft delete: usado pelo "Desfazer" mostrado ao remover um gasto. */
export async function restoreSpending(id: string): Promise<void> {
  const all = readAll();
  const index = all.findIndex((spending) => spending.id === id && spending.deletedAt);
  if (index === -1) return;

  all[index] = { ...all[index], deletedAt: null, updatedAt: new Date().toISOString() };
  writeAll(all);
}
