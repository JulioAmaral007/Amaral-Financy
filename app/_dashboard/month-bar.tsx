"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { ReceiptTitle } from "@/components/ui/receipt";
import { currentMonthKey, monthLabel, shiftMonth } from "@/lib/month";

import { useSelectedMonth } from "./use-selected-month";

const arrowClass =
  "flex h-10 w-10 flex-none items-center justify-center border-2 border-rule text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper";

export function MonthBar() {
  const [month, setMonth] = useSelectedMonth();
  const isCurrent = month === currentMonthKey();

  return (
    <Card className="py-4 sm:py-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          className={arrowClass}
          onClick={() => setMonth(shiftMonth(month, -1))}
          aria-label="Mês anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="min-w-0 text-center">
          <ReceiptTitle className="text-[22px] uppercase tracking-[0.1em] sm:text-[28px]">
            {monthLabel(month)}
          </ReceiptTitle>
          {isCurrent ? (
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-ink-faint">mês atual</p>
          ) : (
            <button
              type="button"
              onClick={() => setMonth(currentMonthKey())}
              className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft underline decoration-dotted underline-offset-4 hover:text-ink"
            >
              voltar para o mês atual
            </button>
          )}
        </div>

        <button
          type="button"
          className={arrowClass}
          onClick={() => setMonth(shiftMonth(month, 1))}
          aria-label="Próximo mês"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </Card>
  );
}
