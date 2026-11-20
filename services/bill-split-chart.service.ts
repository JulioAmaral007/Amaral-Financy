import { MONTH_SHORT_LABELS, makeMonthKey } from "@/lib/month";
import { round2 } from "@/lib/utils";
import type { ChartPoint, ChartYAxisTick, MonthlyTotal } from "@/types/bill-split";
import type { MonthKey } from "@/types/month";

const CHART_WIDTH = 640;
const CHART_LEFT_MARGIN = 54;
const CHART_RIGHT_MARGIN = 30;
const CHART_TOP_Y = 30;
const CHART_BASELINE_Y = 170;

/**
 * Os 12 meses de `year` com o total real de cada um (contas somadas + cartão),
 * a partir de `totalsByMonth`. Meses sem lançamento aparecem como zero — não
 * inventamos um histórico que não existe.
 */
export function getYearlyMonthlyTotals(
  totalsByMonth: Record<MonthKey, number>,
  year: number
): MonthlyTotal[] {
  return MONTH_SHORT_LABELS.map((label, month) => ({
    month,
    label,
    total: round2(totalsByMonth[makeMonthKey(year, month)] ?? 0),
  }));
}

/** Variação do mês sobre o anterior; nulo quando o mês anterior não tem total para comparar. */
export function getMonthDelta(current: number, previous: number): { label: string; positive: boolean } | null {
  if (previous <= 0 || current <= 0) return null;

  const delta = ((current - previous) / previous) * 100;
  const positive = delta <= 0;
  const sign = delta >= 0 ? "+" : "";
  return { label: `${sign}${delta.toFixed(1)}% vs mês anterior`, positive };
}

function getChartMaxValue(months: MonthlyTotal[]): number {
  return Math.max(1, ...months.map((m) => m.total)) * 1.25;
}

/** `currentMonthIndex`: índice (0-11) do mês de hoje no ano exibido, ou nulo se for outro ano. */
export function getChartPoints(months: MonthlyTotal[], currentMonthIndex: number | null): ChartPoint[] {
  const maxValue = getChartMaxValue(months);
  const usableWidth = CHART_WIDTH - CHART_LEFT_MARGIN - CHART_RIGHT_MARGIN;
  const step = months.length > 1 ? usableWidth / (months.length - 1) : 0;

  return months.map((m, index) => ({
    ...m,
    isCurrent: m.month === currentMonthIndex,
    x: round2(CHART_LEFT_MARGIN + index * step),
    y: round2(CHART_BASELINE_Y - (m.total / maxValue) * (CHART_BASELINE_Y - CHART_TOP_Y)),
  }));
}

export function getChartYAxisTicks(months: MonthlyTotal[]): ChartYAxisTick[] {
  const maxValue = getChartMaxValue(months);
  const tickCount = 4;

  return Array.from({ length: tickCount + 1 }, (_, index) => {
    const value = (maxValue / tickCount) * index;
    return {
      value: round2(value),
      y: round2(CHART_BASELINE_Y - (value / maxValue) * (CHART_BASELINE_Y - CHART_TOP_Y)),
    };
  });
}
