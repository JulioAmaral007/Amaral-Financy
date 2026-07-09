import { Card } from "@/components/ui/card";
import { LeaderRow, ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import type { ContributionBar } from "@/services/investment-view.service";

interface ContributionsCardProps {
  contributions: ContributionBar[];
  totalFormatted: string;
  averageFormatted: string;
}

export function ContributionsCard({ contributions, totalFormatted, averageFormatted }: ContributionsCardProps) {
  return (
    <Card className="rotate-[0.2deg]">
      <ReceiptTitle className="text-[18px] tracking-[0.08em] sm:text-[20px]">APORTES</ReceiptTitle>
      <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-ink-faint">
        variação da base de custo mês a mês
      </p>

      <StarDivider className="mb-4 mt-2" />

      {contributions.length === 0 ? (
        <div className="mb-3 border-2 border-dashed border-rule py-7 text-center text-[13px] text-ink-faint">
          Sem aportes registrados ainda.
        </div>
      ) : (
        <div className="mb-2.5 flex h-[76px] items-end justify-between gap-1.5">
          {contributions.map((contribution) => (
            <div
              key={contribution.month}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <div
                className="w-full max-w-[22px] bg-ink opacity-80"
                style={{ height: `${contribution.barPct}%` }}
              />
              <span className="text-[10px] uppercase tracking-[0.06em] text-ink-faint">
                {contribution.monthLabel}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t-2 border-dashed border-rule-faint pt-3">
        <LeaderRow label="Total aportado" value={totalFormatted} />
        <LeaderRow label="Média mensal" value={averageFormatted} />
      </div>
    </Card>
  );
}
