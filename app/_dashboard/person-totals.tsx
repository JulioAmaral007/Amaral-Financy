import { formatCurrencyBRL } from "@/lib/utils";
import type { PersonTotals as PersonTotalsData } from "@/types/bill-split";

interface PersonTotalsProps {
  totals: PersonTotalsData;
}

export function PersonTotals({ totals }: PersonTotalsProps) {
  return (
    <div className="grid grid-cols-3">
      <div className="border-r-2 border-dashed border-rule-faint py-2 pr-4">
        <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-ink-faint">Salário 1</p>
        <p className="text-[19px] font-bold text-ink">{formatCurrencyBRL(totals.person1)}</p>
      </div>
      <div className="border-r-2 border-dashed border-rule-faint px-4 py-2">
        <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-blue">Salário 2</p>
        <p className="text-[19px] font-bold text-ink">{formatCurrencyBRL(totals.person2)}</p>
      </div>
      <div className="py-2 pl-4">
        <p className="mb-1 text-[11px] uppercase tracking-[0.12em] text-red">Salário 3</p>
        <p className="text-[19px] font-bold text-ink">{formatCurrencyBRL(totals.person3)}</p>
      </div>
    </div>
  );
}
