"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { cn } from "@/lib/utils";
import type { PortfolioView } from "@/services/investment-view.service";

import { AreaChart } from "./area-chart";

interface PortfolioHeroProps {
  portfolio: PortfolioView;
  onNewAsset: () => void;
}

export function PortfolioHero({ portfolio, onNewAsset }: PortfolioHeroProps) {
  return (
    <Card className="rotate-[0.2deg]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ReceiptTitle className="text-[21px] tracking-[0.09em] sm:text-[26px]">
            CARTEIRA DE INVESTIMENTOS
          </ReceiptTitle>
          <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-ink-faint">
            patrimônio, rentabilidade e evolução no ano
          </p>
        </div>
        <Button onClick={onNewAsset}>+ Novo ativo</Button>
      </div>

      <StarDivider className="mb-4 mt-2.5" />

      <div className="mb-5 grid grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0 border-r-2 border-dashed border-rule-faint py-1.5 pr-3 sm:pr-4">
          <div className="mb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Patrimônio total</div>
          <div className="break-words text-[19px] font-bold text-ink sm:text-[26px]">
            {portfolio.totalValueFormatted}
          </div>
        </div>
        <div className="min-w-0 border-dashed border-rule-faint py-1.5 pl-3 sm:pl-4 lg:border-r-2 lg:pr-4">
          <div className="mb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">No mês</div>
          <div className="break-words text-[15px] font-bold text-blue sm:text-[17px]">
            {portfolio.monthReturnLabel}
          </div>
        </div>
        <div className="min-w-0 border-r-2 border-dashed border-rule-faint py-1.5 pr-3 sm:pr-4 lg:px-4">
          <div className="mb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">No ano</div>
          <div className="break-words text-[15px] font-bold text-blue sm:text-[17px]">
            {portfolio.yearReturnLabel}
          </div>
        </div>
        <div className="min-w-0 py-1.5 pl-3 sm:pl-4">
          <div className="mb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Ganho total</div>
          <div
            className={cn(
              "break-words text-[15px] font-bold sm:text-[17px]",
              portfolio.gainPositive ? "text-green" : "text-red"
            )}
          >
            {portfolio.gainFormatted}
          </div>
          <div className="text-[12px] text-ink-faint">{portfolio.gainPctLabel} sobre o custo</div>
        </div>
      </div>

      {portfolio.patrimonyPath.length > 0 ? (
        <AreaChart
          values={portfolio.patrimonyPath}
          startLabel={portfolio.patrimonyStartLabel}
          endLabel={portfolio.patrimonyEndLabel}
          endLabelStrong
        />
      ) : (
        <div className="border-2 border-dashed border-rule py-8 text-center text-[13px] text-ink-faint">
          A evolução do patrimônio aparece aqui depois do primeiro ativo lançado.
        </div>
      )}
    </Card>
  );
}
