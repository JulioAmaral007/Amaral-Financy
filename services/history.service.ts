import * as historyRepository from "@/repositories/history.repository";
import type { HistoryEntry } from "@/types/history";
import type { PaginatedResult } from "@/types/pagination";
import type { SalarySplitResult } from "@/types/bill-split";

export const HISTORY_PAGE_SIZE = 8;

/**
 * Todos os cálculos do ano corrente, sem paginação — usado para a
 * agregação por mês do gráfico de Histórico.
 */
export async function getHistoryForCurrentYear(referenceDate: Date = new Date()): Promise<HistoryEntry[]> {
  const year = referenceDate.getFullYear();
  const startIso = new Date(year, 0, 1).toISOString();
  const endIso = new Date(year, 11, 31, 23, 59, 59).toISOString();
  return historyRepository.listHistoryBetween(startIso, endIso);
}

export async function getHistoryPage(
  page: number,
  pageSize: number = HISTORY_PAGE_SIZE
): Promise<PaginatedResult<HistoryEntry>> {
  const safePage = Math.max(1, page);
  const { entries, total } = await historyRepository.listHistoryPage({
    limit: pageSize,
    offset: (safePage - 1) * pageSize,
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
  split: SalarySplitResult,
  billAmount: number
): Promise<HistoryEntry> {
  return historyRepository.createHistoryEntry({
    billAmount,
    salary1Payment: split.salary1Payment,
    salary2Payment: split.salary2Payment,
    salary3Payment: split.salary3Payment,
  });
}
