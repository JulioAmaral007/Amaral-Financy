import { STORAGE_KEYS } from "@/lib/local-storage/keys";
import { readStorage, writeStorage } from "@/lib/local-storage/storage";
import type { HistoryEntry } from "@/types/history";

interface StoredHistoryEntry extends HistoryEntry {
  deletedAt: string | null;
}

function readAll(): StoredHistoryEntry[] {
  return readStorage<StoredHistoryEntry[]>(STORAGE_KEYS.HISTORY, []);
}

function writeAll(entries: StoredHistoryEntry[]): void {
  writeStorage(STORAGE_KEYS.HISTORY, entries);
}

function stripDeleted(entry: StoredHistoryEntry): HistoryEntry {
  return {
    id: entry.id,
    billAmount: entry.billAmount,
    salary1Payment: entry.salary1Payment,
    salary2Payment: entry.salary2Payment,
    salary3Payment: entry.salary3Payment,
    calculatedAt: entry.calculatedAt,
  };
}

function sortByCalculatedAtDesc(entries: HistoryEntry[]): HistoryEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
  );
}

export async function listHistoryBetween(startIso: string, endIso: string): Promise<HistoryEntry[]> {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();

  return sortByCalculatedAtDesc(
    readAll()
      .filter((entry) => !entry.deletedAt)
      .map(stripDeleted)
      .filter((entry) => {
        const time = new Date(entry.calculatedAt).getTime();
        return time >= start && time <= end;
      })
  );
}

export async function listHistoryPage(pagination: {
  limit: number;
  offset: number;
}): Promise<{ entries: HistoryEntry[]; total: number }> {
  const all = sortByCalculatedAtDesc(readAll().filter((entry) => !entry.deletedAt).map(stripDeleted));
  return {
    entries: all.slice(pagination.offset, pagination.offset + pagination.limit),
    total: all.length,
  };
}

export async function createHistoryEntry(input: {
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
    deletedAt: null,
  };

  writeAll([...readAll(), entry]);
  return stripDeleted(entry);
}

/**
 * Soft delete: marca `deletedAt` em vez de remover o registro, preservando
 * o histórico/auditoria — mesmo padrão utilizado em contas fixas.
 */
export async function deleteHistoryEntry(id: string): Promise<void> {
  const all = readAll();
  const index = all.findIndex((entry) => entry.id === id && !entry.deletedAt);
  if (index === -1) return;

  all[index] = { ...all[index], deletedAt: new Date().toISOString() };
  writeAll(all);
}
