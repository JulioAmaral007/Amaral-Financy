import { LeaderRow } from "@/components/ui/receipt";
import * as goalService from "@/services/goal.service";

export async function StatsRow() {
  const stats = await goalService.getGoalsDashboardStatsForCurrentUser();

  return (
    <section>
      <div className="mb-2.5 border-b-2 border-ink pb-1.5 text-[11.5px] font-bold uppercase tracking-[0.2em] text-ink-soft">
        Resumo
      </div>
      <LeaderRow label="Patrimônio em metas" value={stats?.totalCurrentFormatted ?? "R$ 0,00"} />
      <LeaderRow
        label="Patrimônio projetado"
        value={stats?.totalProjectedFormatted ?? "R$ 0,00"}
        valueClassName="text-blue"
      />
      <LeaderRow label="Metas concluídas" value={stats?.completedLabel ?? "0 de 0"} />
    </section>
  );
}
