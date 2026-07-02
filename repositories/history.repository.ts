import { STORAGE_KEYS } from "@/lib/local-storage/keys";
import { readStorage, writeStorage } from "@/lib/local-storage/storage";
import type { HistoryEntry } from "@/types/history";

function readAll(): HistoryEntry[] {
  return readStorage<HistoryEntry[]>(STORAGE_KEYS.HISTORY, []);
}

function writeAll(entries: HistoryEntry[]): void {
  writeStorage(STORAGE_KEYS.HISTORY, entries);
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
    readAll().filter((entry) => {
      const time = new Date(entry.calculatedAt).getTime();
      return time >= start && time <= end;
    })
  );
}

export async function listHistoryPage(pagination: {
  limit: number;
  offset: number;
}): Promise<{ entries: HistoryEntry[]; total: number }> {
  const all = sortByCalculatedAtDesc(readAll());
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
  const entry: HistoryEntry = {
    id: crypto.randomUUID(),
    billAmount: input.billAmount,
    salary1Payment: input.salary1Payment,
    salary2Payment: input.salary2Payment,
    salary3Payment: input.salary3Payment,
    calculatedAt: new Date().toISOString(),
  };

  writeAll([...readAll(), entry]);
  return entry;
}
