import { STORAGE_KEYS } from "@/lib/local-storage/keys";
import { readStorage, writeStorage } from "@/lib/local-storage/storage";
import { addMonthsToDate, monthKeyFromDate } from "@/lib/month";
import { round2 } from "@/lib/utils";
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
    ...(spending.installment ? { installment: spending.installment } : {}),
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

  writeAll([...readAll(), ...created]);
  return created.map(stripDeleted);
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

/**
 * Soft delete da parcela `fromNumber` e das seguintes da mesma compra.
 * Devolve os ids removidos (para o "Desfazer").
 */
export async function deleteInstallmentsFrom(groupId: string, fromNumber: number): Promise<string[]> {
  const now = new Date().toISOString();
  const removed: string[] = [];
  const all = readAll().map((spending) => {
    if (
      spending.deletedAt ||
      spending.installment?.groupId !== groupId ||
      spending.installment.number < fromNumber
    ) {
      return spending;
    }
    removed.push(spending.id);
    return { ...spending, deletedAt: now };
  });

  writeAll(all);
  return removed;
}

/** Reverte um soft delete: usado pelo "Desfazer" mostrado ao remover um gasto. */
export async function restoreSpendings(ids: string[]): Promise<void> {
  const idSet = new Set(ids);
  const now = new Date().toISOString();
  writeAll(
    readAll().map((spending) =>
      idSet.has(spending.id) && spending.deletedAt ? { ...spending, deletedAt: null, updatedAt: now } : spending
    )
  );
}

export async function restoreSpending(id: string): Promise<void> {
  return restoreSpendings([id]);
}
