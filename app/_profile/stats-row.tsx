import { LeaderRow } from "@/components/ui/receipt";
import * as investmentService from "@/services/investment.service";

export async function StatsRow() {
  const summary = await investmentService.getInvestmentsSummary();

  return (
    <section>
      <div className="mb-2.5 border-b-2 border-ink pb-1.5 text-[11.5px] font-bold uppercase tracking-[0.2em] text-ink-soft">
        Resumo
      </div>
      <LeaderRow label="Patrimônio investido" value={summary?.totalValueFormatted ?? "R$ 0,00"} />
      <LeaderRow label="Ganho acumulado" value={summary?.gainFormatted ?? "R$ 0,00"} valueClassName="text-blue" />
      <LeaderRow label="Rentabilidade no ano" value={summary?.yearReturnLabel ?? "—"} />
    </section>
  );
}
