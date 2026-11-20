"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { ReceiptTitle, SectionLabel, StarDivider } from "@/components/ui/receipt";
import { MONTH_NAMES, makeMonthKey, parseMonthKey, shiftMonth } from "@/lib/month";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import * as billSplitChartService from "@/services/bill-split-chart.service";
import * as historyService from "@/services/history.service";
import * as monthService from "@/services/month.service";
import type { ChartPoint, ChartYAxisTick } from "@/types/bill-split";
import type { HistoryEntry } from "@/types/history";

import { HistoryChart } from "./history-chart";
import { HistoryList } from "./history-list";
import { useDataReloadKey } from "./use-data-reload-key";
import { useSelectedMonth } from "./use-selected-month";

interface HistoryData {
  month: string;
  chartPoints: ChartPoint[];
  chartYAxisTicks: ChartYAxisTick[];
  delta: { label: string; positive: boolean } | null;
  monthTotal: number;
  historyItems: HistoryEntry[];
  page: number;
  totalPages: number;
}

export function HistorySection() {
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("historyPage")) || 1);
  const [month, setMonth] = useSelectedMonth();
  const reloadKey = useDataReloadKey();
  const [data, setData] = useState<HistoryData | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([monthService.getTotalsByMonth(), historyService.getHistoryPage(month, page)]).then(
      ([totalsByMonth, historyPage]) => {
        if (cancelled) return;

        const { year, monthIndex } = parseMonthKey(month);
        const today = new Date();
        const currentMonthIndex = today.getFullYear() === year ? today.getMonth() : null;

        const monthlyTotals = billSplitChartService.getYearlyMonthlyTotals(totalsByMonth, year);
        const monthTotal = monthlyTotals[monthIndex].total;

        setData({
          month,
          chartPoints: billSplitChartService.getChartPoints(monthlyTotals, currentMonthIndex),
          chartYAxisTicks: billSplitChartService.getChartYAxisTicks(monthlyTotals),
          delta: billSplitChartService.getMonthDelta(monthTotal, totalsByMonth[shiftMonth(month, -1)] ?? 0),
          monthTotal,
          historyItems: historyPage.items,
          page: historyPage.page,
          totalPages: historyPage.totalPages,
        });
      }
    );

    return () => {
      cancelled = true;
    };
  }, [month, page, reloadKey]);

  if (!data || data.month !== month) return null;

  const { year, monthIndex } = parseMonthKey(month);

  return (
    <Card className="-rotate-[0.3deg]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <ReceiptTitle className="text-[21px] tracking-[0.08em] sm:text-[27px]">GASTOS EM {year}</ReceiptTitle>
          <p className="mt-0.5 text-[12px] uppercase tracking-[0.14em] text-ink-faint">
            contas somadas + cartão, por mês
          </p>
        </div>
        {data.delta && (
          <span
            className={cn(
              "inline-block -rotate-3 whitespace-nowrap border-2 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.12em] opacity-85",
              data.delta.positive ? "border-green text-green" : "border-red text-red"
            )}
          >
            {data.delta.label}
          </span>
        )}
      </div>

      <StarDivider className="my-4" />

      <HistoryChart
        points={data.chartPoints}
        yAxisTicks={data.chartYAxisTicks}
        selectedMonth={monthIndex}
        onSelectMonth={(selected) => setMonth(makeMonthKey(year, selected))}
      />

      <p className="mt-2 text-center text-[12px] uppercase tracking-[0.14em] text-ink-faint">
        total de {MONTH_NAMES[monthIndex]}: <span className="font-bold text-ink">{formatCurrencyBRL(data.monthTotal)}</span>
      </p>

      <div className="mt-4 border-t-2 border-dashed border-rule-faint pt-4">
        <SectionLabel className="mb-1.5">Divisões registradas em {MONTH_NAMES[monthIndex]}</SectionLabel>
        <HistoryList entries={data.historyItems} />
        <Pagination page={data.page} totalPages={data.totalPages} paramName="historyPage" />
      </div>
    </Card>
  );
}
