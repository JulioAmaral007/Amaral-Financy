"use client";

import { useEffect, useState } from "react";

import { shiftMonth } from "@/lib/month";
import { notifyLoadError } from "@/lib/load-error";
import * as historyService from "@/services/history.service";
import * as monthService from "@/services/month.service";
import type { MonthSnapshot } from "@/services/month.service";

import { CalculatorForm } from "./calculator-form";
import { MonthSummaryCard } from "./month-summary-card";
import { useDataReloadKey } from "./use-data-reload-key";
import { useSelectedMonth } from "./use-selected-month";

interface HeroData {
  month: string;
  snapshot: MonthSnapshot;
  historyCount: number;
  previousTotal: number;
}

/** Topo do mês: com a divisão ligada no perfil, a calculadora; sem ela, só o resumo. */
export function CalculatorSection() {
  const [month] = useSelectedMonth();
  const reloadKey = useDataReloadKey();
  const [data, setData] = useState<HeroData | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      monthService.getMonthSnapshot(month),
      historyService.getHistoryPage(month, 1, 1),
      monthService.getTotalsByMonth(),
    ]).then(([snapshot, historyPage, totalsByMonth]) => {
      if (cancelled) return;
      setData({
        month,
        snapshot,
        historyCount: historyPage.total,
        previousTotal: totalsByMonth[shiftMonth(month, -1)] ?? 0,
      });
    }, notifyLoadError);

    return () => {
      cancelled = true;
    };
  }, [month, reloadKey]);

  // Não mostra dados de outro mês enquanto o mês escolhido ainda carrega.
  if (!data || data.month !== month) return null;

  if (!data.snapshot.workspace.splitEnabled) {
    return <MonthSummaryCard key={month} snapshot={data.snapshot} previousTotal={data.previousTotal} />;
  }

  return (
    // `key` recria o formulário ao trocar de mês, reiniciando os campos com os valores do novo mês.
    <CalculatorForm
      key={month}
      snapshot={data.snapshot}
      historyCount={data.historyCount}
      previousTotal={data.previousTotal}
    />
  );
}
