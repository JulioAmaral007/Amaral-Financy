"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MONTH_NAMES, MONTH_SHORT_LABELS, currentMonthKey, makeMonthKey, parseMonthKey, shiftMonth } from "@/lib/month";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import * as monthService from "@/services/month.service";

import { useDataReloadKey } from "./use-data-reload-key";
import { useSelectedMonth } from "./use-selected-month";

const arrowClass =
  "flex h-9 w-9 flex-none cursor-pointer items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5";

/**
 * Navegação por mês que também é o gráfico do ano: cada mês é uma coluna cuja
 * altura é o total (contas somadas + cartão). Clicar numa coluna abre o mês.
 */
export function YearRuler() {
  const [month, setMonth] = useSelectedMonth();
  const reloadKey = useDataReloadKey();
  const [totalsByMonth, setTotalsByMonth] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    let cancelled = false;
    monthService.getTotalsByMonth().then((totals) => {
      if (!cancelled) setTotalsByMonth(totals);
    });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const { year, monthIndex } = parseMonthKey(month);
  const today = currentMonthKey();
  const isCurrent = month === today;

  const totals = MONTH_SHORT_LABELS.map((_, index) => totalsByMonth?.[makeMonthKey(year, index)] ?? 0);
  const max = Math.max(1, ...totals);

  const goToday = !isCurrent && (
    <button
      type="button"
      onClick={() => setMonth(today)}
      className="flex-none cursor-pointer rounded-full px-3 py-1.5 text-[13px] font-semibold text-thais transition-colors hover:bg-thais/10"
    >
      Hoje
    </button>
  );

  return (
    // Uma linha só no desktop (ano + meses); no celular o ano fica em cima.
    <nav aria-label="Escolher mês" className="mb-3 flex flex-col gap-1 sm:mb-4 sm:flex-row sm:items-center sm:gap-3">
      <div className="flex flex-none items-center gap-0.5">
        <button type="button" className={arrowClass} onClick={() => setMonth(shiftMonth(month, -12))} aria-label="Ano anterior">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="font-display text-[15px] font-semibold tabular-nums text-ink">{year}</span>
        <button type="button" className={arrowClass} onClick={() => setMonth(shiftMonth(month, 12))} aria-label="Próximo ano">
          <ChevronRight className="h-4 w-4" />
        </button>
        <span className="ml-auto sm:hidden">{goToday}</span>
      </div>

      <div className="grid flex-1 grid-cols-12 gap-0.5 sm:gap-1.5">
        {MONTH_SHORT_LABELS.map((label, index) => {
          const key = makeMonthKey(year, index);
          const total = totals[index];
          const isSelected = index === monthIndex;
          const isToday = key === today;
          const height = total > 0 ? Math.max(12, (total / max) * 100) : 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setMonth(key)}
              aria-current={isSelected ? "date" : undefined}
              aria-label={`${MONTH_NAMES[index]}: ${total > 0 ? formatCurrencyBRL(total) : "sem lançamentos"}`}
              title={total > 0 ? formatCurrencyBRL(total) : undefined}
              className={cn(
                "group flex cursor-pointer flex-col items-center gap-1 rounded-xl px-0.5 py-1.5 transition-colors",
                isSelected ? "bg-surface shadow-raised" : "hover:bg-surface/60"
              )}
            >
              <div className="flex h-6 w-full items-end justify-center sm:h-7">
                <div
                  className={cn(
                    "w-1.5 rounded-full transition-all duration-500 sm:w-2",
                    total === 0 && "h-0.5 bg-ink/10",
                    total > 0 && (isSelected ? "bg-ink" : "bg-ink/20 group-hover:bg-ink/35")
                  )}
                  style={total > 0 ? { height: `${height}%` } : undefined}
                />
              </div>
              <span
                className={cn(
                  "relative text-[11px] leading-none sm:text-[12px]",
                  isSelected ? "font-bold text-ink" : "text-muted"
                )}
              >
                {label}
                {isToday && (
                  <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-julio" />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <span className="hidden sm:block">{goToday}</span>
    </nav>
  );
}
