"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Pagination } from "@/components/ui/pagination";
import * as billSplitChartService from "@/services/bill-split-chart.service";
import * as billSplitService from "@/services/bill-split.service";
import * as fixedBillService from "@/services/fixed-bill.service";
import * as historyService from "@/services/history.service";
import * as profileService from "@/services/profile.service";
import type { ChartPoint } from "@/types/bill-split";
import type { FixedBill } from "@/types/fixed-bill";
import type { HistoryEntry } from "@/types/history";

import { HistoryChart } from "./history-chart";
import { HistoryList } from "./history-list";
import { PersonTotals } from "./person-totals";

interface HistoryData {
  chartPoints: ChartPoint[];
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
      const delta = billSplitChartService.getMonthDelta(monthlyTotals);

      setData({
        chartPoints,
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
  }, [page]);

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
    <section className="mb-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2.5">
        <div>
          <h2 className="text-[30px] text-foreground">Gastos no Ano</h2>
          <p className="mt-1 text-[13.5px] text-foreground/60">Total de contas fixas + avulsas por mês</p>
        </div>
        {data.delta && (
          <span
            className={
              data.delta.positive
                ? "rounded-full bg-primary/14 px-2.5 py-1 text-[12.5px] font-semibold text-primary-soft"
                : "rounded-full bg-amber/14 px-2.5 py-1 text-[12.5px] font-semibold text-amber-soft"
            }
          >
            {data.delta.label}
          </span>
        )}
      </div>

      <HistoryChart points={data.chartPoints} selectedMonth={activeMonth} onSelectMonth={setSelectedMonth} />

      <p className="mb-3 text-[13.5px] font-semibold text-foreground">
        Quanto cada salário pagou em <span className="text-primary-soft">{activeMonthLabel}</span>
      </p>
      <PersonTotals totals={personTotals} />

      <p className="mb-3 text-[13.5px] font-semibold text-foreground">Histórico de Cálculos</p>
      <HistoryList entries={data.historyItems} />
      <Pagination page={data.page} totalPages={data.totalPages} paramName="historyPage" />
    </section>
  );
}
