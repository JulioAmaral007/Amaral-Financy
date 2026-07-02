import { round2 } from "@/lib/utils";
import type { HistoryEntry } from "@/types/history";
import type { ChartPoint, MonthlyTotal } from "@/types/bill-split";

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const CHART_WIDTH = 640;
const CHART_LEFT_MARGIN = 30;
const CHART_RIGHT_MARGIN = 30;
const CHART_TOP_Y = 30;
const CHART_BASELINE_Y = 170;

/**
 * Totais reais por mês no ano corrente, somando apenas os cálculos
 * efetivamente registrados (bill_split_history). Meses sem cálculo aparecem
 * como zero — não inventamos um histórico anterior à existência dos dados.
 * O mês corrente também soma o total das contas fixas ativas.
 */
export function getYearlyMonthlyTotals(
  historyEntries: HistoryEntry[],
  fixedBillsTotal: number,
  referenceDate: Date = new Date()
): MonthlyTotal[] {
  const currentMonthIndex = referenceDate.getMonth();
  const currentYear = referenceDate.getFullYear();

  const totalsByMonth = new Map<number, number>();
  for (const entry of historyEntries) {
    const entryDate = new Date(entry.calculatedAt);
    if (entryDate.getFullYear() !== currentYear) continue;
    const month = entryDate.getMonth();
    totalsByMonth.set(month, (totalsByMonth.get(month) ?? 0) + entry.billAmount);
  }

  const months: MonthlyTotal[] = [];
  for (let month = 0; month <= currentMonthIndex; month++) {
    const historyTotal = totalsByMonth.get(month) ?? 0;
    const total = month === currentMonthIndex ? historyTotal + fixedBillsTotal : historyTotal;
    months.push({ month, label: MONTH_LABELS[month], total: round2(total) });
  }

  return months;
}

export function getMonthDelta(months: MonthlyTotal[]): { label: string; positive: boolean } | null {
  if (months.length < 2) return null;

  const previous = months[months.length - 2].total;
  const current = months[months.length - 1].total;
  if (previous <= 0) return null;

  const delta = ((current - previous) / previous) * 100;
  const positive = delta <= 0;
  const sign = delta >= 0 ? "+" : "";
  return { label: `${sign}${delta.toFixed(1)}% vs mês anterior`, positive };
}

export function getChartPoints(months: MonthlyTotal[]): ChartPoint[] {
  const maxValue = Math.max(1, ...months.map((m) => m.total)) * 1.25;
  const currentMonthIndex = months.length - 1;
  const usableWidth = CHART_WIDTH - CHART_LEFT_MARGIN - CHART_RIGHT_MARGIN;
  const step = months.length > 1 ? usableWidth / (months.length - 1) : 0;

  return months.map((m, index) => ({
    ...m,
    isCurrent: index === currentMonthIndex,
    x: round2(CHART_LEFT_MARGIN + index * step),
    y: round2(CHART_BASELINE_Y - (m.total / maxValue) * (CHART_BASELINE_Y - CHART_TOP_Y)),
  }));
}
