import * as historyRepository from "@/repositories/history.repository";
import type { HistoryEntry } from "@/types/history";
import type { PaginatedResult } from "@/types/pagination";
import type { SalarySplitResult } from "@/types/bill-split";

export const HISTORY_PAGE_SIZE = 8;

/** Divisões registradas de um mês, mais recentes primeiro. */
export async function getHistoryPage(
  month: string,
  page: number,
  pageSize: number = HISTORY_PAGE_SIZE
): Promise<PaginatedResult<HistoryEntry>> {
  const safePage = Math.max(1, page);
  const { entries, total } = await historyRepository.listHistoryPage({
    limit: pageSize,
    offset: (safePage - 1) * pageSize,
    month,
  });

  return {
    items: entries,
    page: safePage,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function recordCalculation(
  month: string,
  split: SalarySplitResult,
  billAmount: number
): Promise<HistoryEntry> {
  return historyRepository.createHistoryEntry({
    month,
    billAmount,
    salary1Payment: split.salary1Payment,
    salary2Payment: split.salary2Payment,
    salary3Payment: split.salary3Payment,
  });
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
  return historyRepository.updateHistoryEntry(id, input);
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  return historyRepository.deleteHistoryEntry(id);
}

export async function restoreHistoryEntry(id: string): Promise<void> {
  return historyRepository.restoreHistoryEntry(id);
}
