import { formatCurrencyBRL } from "@/lib/utils";
import type { PersonTotals as PersonTotalsData } from "@/types/bill-split";

interface PersonTotalsProps {
  totals: PersonTotalsData;
}

export function PersonTotals({ totals }: PersonTotalsProps) {
  return (
    <div className="grid grid-cols-3">
      <div className="min-w-0 border-r-2 border-dashed border-rule-faint py-2 pr-2 sm:pr-4">
        <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-ink-faint sm:text-[11px]">Salário 1</p>
        <p className="break-words text-[13px] font-bold text-ink sm:text-[19px]">{formatCurrencyBRL(totals.person1)}</p>
      </div>
      <div className="min-w-0 border-r-2 border-dashed border-rule-faint px-2 py-2 sm:px-4">
        <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-blue sm:text-[11px]">Salário 2</p>
        <p className="break-words text-[13px] font-bold text-ink sm:text-[19px]">{formatCurrencyBRL(totals.person2)}</p>
      </div>
      <div className="min-w-0 py-2 pl-2 sm:pl-4">
        <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-red sm:text-[11px]">Salário 3</p>
        <p className="break-words text-[13px] font-bold text-ink sm:text-[19px]">{formatCurrencyBRL(totals.person3)}</p>
      </div>
    </div>
  );
}
