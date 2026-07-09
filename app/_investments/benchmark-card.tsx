import { Card } from "@/components/ui/card";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import type { BenchmarkRow } from "@/services/investment-view.service";

interface BenchmarkCardProps {
  benchmarks: BenchmarkRow[];
  monthLabel: string;
}

export function BenchmarkCard({ benchmarks, monthLabel }: BenchmarkCardProps) {
  return (
    <Card className="-rotate-[0.2deg]">
      <ReceiptTitle className="text-[18px] tracking-[0.08em] sm:text-[22px]">
        RENTABILIDADE vs. MERCADO
      </ReceiptTitle>
      <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-ink-faint">
        acumulado no ano · sua carteira contra os índices
      </p>

      <StarDivider className="mb-[18px] mt-2.5" />

      <div className="flex flex-col gap-3.5">
        {benchmarks.map((benchmark) => (
          <div key={benchmark.key} className="flex items-center gap-3 sm:gap-4">
            <span className="w-[64px] flex-none text-[11px] font-bold uppercase tracking-[0.1em] text-ink-soft sm:w-[88px] sm:text-[12px]">
              {benchmark.label}
            </span>
            <div className="h-5 flex-1 border-[1.5px] border-ink bg-paper">
              <div
                className="h-full opacity-85"
                style={{ width: `${benchmark.barWidthPct}%`, background: benchmark.color }}
              />
            </div>
            <span className="w-[58px] flex-none text-right text-[13px] font-bold text-ink sm:w-[64px] sm:text-[14px]">
              {benchmark.valueLabel}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-[18px] border-t-2 border-dashed border-rule-faint pt-3 text-[12px] text-ink-soft sm:text-[12.5px]">
        No mês: {monthLabel}
      </p>
    </Card>
  );
}
