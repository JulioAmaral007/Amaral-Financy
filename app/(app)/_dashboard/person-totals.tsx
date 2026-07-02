import { formatCurrencyBRL } from "@/lib/utils";
import type { PersonTotals as PersonTotalsData } from "@/types/bill-split";

interface PersonTotalsProps {
  totals: PersonTotalsData;
}

export function PersonTotals({ totals }: PersonTotalsProps) {
  return (
    <div className="mb-7 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
      <div className="rounded-xl bg-primary/16 p-4">
        <p className="mb-1.5 text-xs font-semibold text-primary-soft">Salário 1 pagou</p>
        <p className="font-mono text-lg font-bold text-foreground">{formatCurrencyBRL(totals.person1)}</p>
      </div>
      <div className="rounded-xl bg-blue/16 p-4">
        <p className="mb-1.5 text-xs font-semibold text-blue-soft">Salário 2 pagou</p>
        <p className="font-mono text-lg font-bold text-foreground">{formatCurrencyBRL(totals.person2)}</p>
      </div>
      <div className="rounded-xl bg-purple/16 p-4">
        <p className="mb-1.5 text-xs font-semibold text-purple-soft">Salário 3 pagou</p>
        <p className="font-mono text-lg font-bold text-foreground">{formatCurrencyBRL(totals.person3)}</p>
      </div>
    </div>
  );
}
