"use client";

import { useEffect, useState } from "react";

import * as monthService from "@/services/month.service";
import type { MonthSnapshot } from "@/services/month.service";

import { CalculatorForm, type CalculatorResultPayload } from "./calculator-form";
import { CalculatorResultPanel } from "./calculator-result-panel";
import { useDataReloadKey } from "./use-data-reload-key";
import { useSelectedMonth } from "./use-selected-month";

export function CalculatorSection() {
  const [month] = useSelectedMonth();
  const reloadKey = useDataReloadKey();
  const [snapshot, setSnapshot] = useState<MonthSnapshot | null>(null);
  const [payload, setPayload] = useState<CalculatorResultPayload | null>(null);

  useEffect(() => {
    let cancelled = false;

    monthService.getMonthSnapshot(month).then((result) => {
      if (!cancelled) setSnapshot(result);
    });

    return () => {
      cancelled = true;
    };
  }, [month, reloadKey]);

  // Não mostra dados de outro mês enquanto o mês escolhido ainda carrega.
  if (!snapshot || snapshot.month !== month) return null;

  return (
    <section className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
      {/* `key` recria o formulário ao trocar de mês, reiniciando os campos com os valores do novo mês. */}
      <CalculatorForm key={month} snapshot={snapshot} onResult={setPayload} />
      <CalculatorResultPanel payload={payload} />
    </section>
  );
}
