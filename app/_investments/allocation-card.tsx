import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { INVESTOR_PROFILE_META } from "@/services/investment-math.service";
import type { AllocationRow } from "@/services/investment-view.service";
import type { InvestorProfile } from "@/types/investment";

interface AllocationCardProps {
  allocation: AllocationRow[];
  investorProfile: InvestorProfile;
  hasAssets: boolean;
}

export function AllocationCard({ allocation, investorProfile, hasAssets }: AllocationCardProps) {
  return (
    <Card className="rotate-[0.15deg]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ReceiptTitle className="text-[18px] tracking-[0.08em] sm:text-[22px]">ALOCAÇÃO POR CLASSE</ReceiptTitle>
          <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-ink-faint">
            distribuição atual vs. alvo do perfil {INVESTOR_PROFILE_META[investorProfile].label}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] text-ink-faint">
          <span aria-hidden className="inline-block h-0.5 w-3.5 bg-red" /> alvo
        </div>
      </div>

      <StarDivider className="mb-[18px] mt-2.5" />

      {!hasAssets ? (
        <div className="border-2 border-dashed border-rule py-8 text-center text-[13px] text-ink-faint">
          Cadastre um ativo para ver como sua carteira se compara ao perfil escolhido.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {allocation.map((row) => (
            <div key={row.assetClass}>
              <div className="mb-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span aria-hidden className="inline-block h-3 w-3 flex-none" style={{ background: row.color }} />
                <span className="text-[13px] font-bold text-ink sm:text-[13.5px]">{row.label}</span>
                <span className="flex-1" />
                <span className="hidden text-[12.5px] text-ink-faint sm:inline">alvo {row.targetLabel}</span>
                {row.driftLabel && <Badge tone="primary">{row.driftLabel}</Badge>}
                <span className="w-[56px] text-right text-[13px] font-bold text-ink sm:w-[64px] sm:text-[13.5px]">
                  {row.pctLabel}
                </span>
                <span className="w-[92px] text-right text-[12px] text-ink-soft sm:w-[120px] sm:text-[13px]">
                  {row.valueFormatted}
                </span>
              </div>
              <div className="relative h-[15px] border-[1.5px] border-ink bg-paper">
                <div
                  className="h-full opacity-85"
                  style={{ width: `${Math.min(100, row.pct)}%`, background: row.color }}
                />
                <div
                  aria-hidden
                  className="absolute -top-[3px] -bottom-[3px] w-[2px] -translate-x-1/2 bg-red"
                  style={{ left: `${row.targetPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
