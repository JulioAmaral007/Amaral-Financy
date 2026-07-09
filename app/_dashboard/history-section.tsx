"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { ReceiptTitle, SectionLabel, StarDivider } from "@/components/ui/receipt";
import { cn } from "@/lib/utils";
import { onHistoryUpdated } from "@/lib/history-events";
import * as billSplitChartService from "@/services/bill-split-chart.service";
import * as billSplitService from "@/services/bill-split.service";
import * as fixedBillService from "@/services/fixed-bill.service";
import * as historyService from "@/services/history.service";
import * as profileService from "@/services/profile.service";
import type { ChartPoint, ChartYAxisTick } from "@/types/bill-split";
import type { FixedBill } from "@/types/fixed-bill";
import type { HistoryEntry } from "@/types/history";

import { HistoryChart } from "./history-chart";
import { HistoryList } from "./history-list";
import { PersonTotals } from "./person-totals";

interface HistoryData {
  chartPoints: ChartPoint[];
  chartYAxisTicks: ChartYAxisTick[];
  delta: { label: string; positive: boolean } | null;
  historyForYear: HistoryEntry[];
  fixedBills: FixedBill[];
  salaries: { salary1: number; salary2: number; salary3: number };
  currentMonthIndex: number;
  historyItems: HistoryEntry[];
  page: number;
  totalPages: number;
}

export function HistorySection() {
  const searchParams = useSearchParams();
  const page = Math.max(1, Number(searchParams.get("historyPage")) || 1);
  const [data, setData] = useState<HistoryData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      profileService.getProfile(),
      fixedBillService.getAllFixedBills(),
      historyService.getHistoryForCurrentYear(),
      historyService.getHistoryPage(page),
    ]).then(([profile, fixedBills, historyForYear, historyPage]) => {
      if (cancelled) return;

      const fixedBillsTotal = fixedBills.reduce((sum, bill) => sum + bill.amount, 0);
      const monthlyTotals = billSplitChartService.getYearlyMonthlyTotals(historyForYear, fixedBillsTotal);
      const chartPoints = billSplitChartService.getChartPoints(monthlyTotals);
      const chartYAxisTicks = billSplitChartService.getChartYAxisTicks(monthlyTotals);
      const delta = billSplitChartService.getMonthDelta(monthlyTotals);

      setData({
        chartPoints,
        chartYAxisTicks,
        delta,
        historyForYear,
        fixedBills,
        salaries: { salary1: profile.salary1, salary2: profile.salary2, salary3: profile.salary3 },
        currentMonthIndex: new Date().getMonth(),
        historyItems: historyPage.items,
        page: historyPage.page,
        totalPages: historyPage.totalPages,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  useEffect(() => onHistoryUpdated(() => setReloadKey((key) => key + 1)), []);

  const activeMonth = selectedMonth ?? data?.currentMonthIndex ?? 0;

  const personTotals = useMemo(() => {
    if (!data) return null;

    const isCurrentMonth = activeMonth === data.currentMonthIndex;
    const referenceDate = new Date(new Date().getFullYear(), activeMonth, 1);
    const historyForMonth = billSplitService.filterHistoryForMonth(data.historyForYear, referenceDate);

    return billSplitService.getPersonTotalsForMonth(
      isCurrentMonth ? data.fixedBills : [],
      historyForMonth,
      data.salaries
    );
  }, [data, activeMonth]);

  if (!data || !personTotals) return null;

  const activeMonthLabel = data.chartPoints.find((point) => point.month === activeMonth)?.label ?? "";

  return (
    <Card className="-rotate-[0.3deg]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <ReceiptTitle className="text-[27px] tracking-[0.08em]">GASTOS NO ANO</ReceiptTitle>
          <p className="mt-0.5 text-[12px] uppercase tracking-[0.14em] text-ink-faint">
            contas fixas + avulsas por mês
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
        selectedMonth={activeMonth}
        onSelectMonth={setSelectedMonth}
      />

      <div className="mt-4 border-t-2 border-dashed border-rule-faint pt-4">
        <SectionLabel className="mb-2.5">
          Quanto cada salário pagou em {activeMonthLabel}
        </SectionLabel>
        <PersonTotals totals={personTotals} />
      </div>

      <div className="mt-4 border-t-2 border-dashed border-rule-faint pt-4">
        <SectionLabel className="mb-1.5">Histórico de cálculos</SectionLabel>
        <HistoryList entries={data.historyItems} onChanged={() => setReloadKey((key) => key + 1)} />
        <Pagination page={data.page} totalPages={data.totalPages} paramName="historyPage" />
      </div>
    </Card>
  );
}
