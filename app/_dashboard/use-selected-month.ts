"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { currentMonthKey, isMonthKey } from "@/lib/month";
import type { MonthKey } from "@/types/month";

const MONTH_PARAM = "mes";

/**
 * Mês exibido no dashboard, guardado na URL (`?mes=2026-11`) para que o mês
 * sobreviva a recarregar a página e possa ser favoritado. Sem o parâmetro,
 * vale o mês corrente.
 */
export function useSelectedMonth(): [MonthKey, (month: MonthKey) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const raw = searchParams.get(MONTH_PARAM);
  const month = raw && isMonthKey(raw) ? raw : currentMonthKey();

  const setMonth = useCallback(
    (next: MonthKey) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(MONTH_PARAM, next);
      params.delete("historyPage");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return [month, setMonth];
}
