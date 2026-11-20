import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { MONTH_NAMES, parseMonthKey, shiftMonth } from "@/lib/month";
import { formatCurrencyBRL } from "@/lib/utils";
import type { MonthKey, MonthTotals } from "@/types/month";

import { MonthProgress, type ProgressStep } from "./month-progress";

interface MonthTotalHeaderProps {
  month: MonthKey;
  totals: MonthTotals;
  /** Total do mês anterior, para a variação. */
  previousTotal: number;
  steps: ProgressStep[];
}

/** Topo do mês: nome, total grande, de onde ele vem, variação e o anel de fechamento. */
export function MonthTotalHeader({ month, totals, previousTotal, steps }: MonthTotalHeaderProps) {
  const { year, monthIndex } = parseMonthKey(month);
  const previousName = MONTH_NAMES[parseMonthKey(shiftMonth(month, -1)).monthIndex].toLowerCase();
  const delta =
    previousTotal > 0 && totals.total > 0 ? ((totals.total - previousTotal) / previousTotal) * 100 : null;

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-display text-[15px] font-semibold text-muted sm:text-[16px]">
          {MONTH_NAMES[monthIndex]} de {year}
        </h1>
        <p className="money mt-0.5 text-[38px] font-bold leading-none tracking-[-0.035em] text-ink sm:text-[52px]">
          {formatCurrencyBRL(totals.total)}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[13px] text-muted">
          <span>
            contas {formatCurrencyBRL(totals.bills)} + cartão {formatCurrencyBRL(totals.spending)}
          </span>
          {delta !== null && Math.abs(delta) >= 0.1 && (
            <Badge tone={delta <= 0 ? "good" : "bad"} className="py-0.5">
              {delta <= 0 ? <ArrowDownRight className="h-3.5 w-3.5" /> : <ArrowUpRight className="h-3.5 w-3.5" />}
              {Math.abs(delta).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% vs {previousName}
            </Badge>
          )}
        </div>
      </div>

      <MonthProgress steps={steps} />
    </div>
  );
}
