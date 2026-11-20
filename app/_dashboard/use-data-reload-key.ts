"use client";

import { useEffect, useState } from "react";

import { onFixedBillsUpdated } from "@/lib/fixed-bill-events";
import { onHistoryUpdated } from "@/lib/history-events";
import { onMonthDataUpdated } from "@/lib/month-events";

/**
 * Contador que sobe sempre que algo do dashboard muda (contas, gastos, ajustes
 * do mês ou histórico). Use como dependência de um `useEffect` de carga de
 * dados — o `localStorage` não tem invalidação, então o aviso é por eventos.
 */
export function useDataReloadKey(): number {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const bump = () => setKey((value) => value + 1);
    const unsubscribers = [onFixedBillsUpdated(bump), onMonthDataUpdated(bump), onHistoryUpdated(bump)];
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  return key;
}
