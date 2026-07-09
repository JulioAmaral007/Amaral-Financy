"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { deleteGoalAction } from "@/actions/goal.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HatchBar, LeaderRow, StarDivider } from "@/components/ui/receipt";
import { cn, formatCurrencyBRL, formatPercent } from "@/lib/utils";
import type { GoalView } from "@/services/goal.service";

import { CATEGORY_BADGE_CLASSES } from "./goal-card";
import { GoalChart } from "./goal-chart";

interface GoalDetailProps {
  goal: GoalView;
  onBack: () => void;
  onEdit: () => void;
  onDeleted: () => void;
}

export function GoalDetail({ goal, onBack, onEdit, onDeleted }: GoalDetailProps) {
  const [isDeleting, startDeleting] = useTransition();

  function handleDelete() {
    startDeleting(async () => {
      const result = await deleteGoalAction({ id: goal.id });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      onDeleted();
    });
  }

  const rateLabel =
    goal.rateMode === "cdi"
      ? `${goal.cdiPercent}% do CDI (≈ ${formatPercent(goal.sim.annualRate * 100)} a.a.)`
      : `${formatPercent(goal.fixedAnnualRate)} a.a. fixa`;

  const completionLabel =
    goal.sim.reachable && goal.sim.completionDate
      ? goal.sim.completionDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
      : "prazo muito longo";

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-[18px] cursor-pointer text-[12.5px] font-bold uppercase tracking-[0.12em] text-ink-soft hover:text-ink"
      >
        &lt;- Voltar
      </button>

      <Card className="rotate-[0.2deg]">
        <div className="flex flex-wrap items-center gap-4">
          <div
            className={cn(
              "flex h-11 w-11 flex-none -rotate-3 items-center justify-center rounded-full border-2 text-sm font-bold opacity-90",
              CATEGORY_BADGE_CLASSES[goal.categoryTone]
            )}
          >
            {goal.categoryGlyph}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-[24px] tracking-[0.06em] text-ink">{goal.name}</div>
            <div className="text-[12.5px] text-ink-faint">{goal.description || goal.categoryLabel}</div>
          </div>
          <div className="flex gap-2.5">
            <Button variant="outline" onClick={onEdit} className="px-4 py-2 text-[11.5px]">
              Editar
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 text-[11.5px]">
              Excluir
            </Button>
          </div>
        </div>

        <StarDivider className="mb-[18px] mt-2" />

        <div className="grid items-start gap-9 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ink-soft">
                Evolução projetada
              </span>
              <span className="text-[13.5px] font-bold text-ink">{goal.progressPctLabel}</span>
            </div>
            <HatchBar pct={goal.sim.progressPct} className="mb-5" />
            <GoalChart path={goal.sim.path} startLabel="Hoje" endLabel={completionLabel} />
            <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">
              Projeção considera aporte mensal de {formatCurrencyBRL(goal.monthlyContribution)} e rendimento de{" "}
              {rateLabel}, a partir do saldo atual.
            </p>
          </div>

          <div className="border-t-2 border-dashed border-rule-faint pt-4 lg:border-l-2 lg:border-t-0 lg:pl-8 lg:pt-0">
            <LeaderRow label="Acumulado" value={goal.currentValueFormatted} className="py-2" />
            <LeaderRow label="Alvo" value={goal.targetValueFormatted} className="py-2" />
            <LeaderRow
              label="Aportado até hoje"
              value={formatCurrencyBRL(goal.sim.totalContributedSoFar)}
              className="py-2"
            />
            <LeaderRow
              label="Rendimento obtido"
              value={formatCurrencyBRL(goal.sim.yieldSoFar)}
              valueClassName="text-blue"
              className="py-2"
            />
            <LeaderRow
              label="Patrimônio projetado"
              value={formatCurrencyBRL(goal.sim.projectedFinalValue)}
              className="py-2"
            />
            <div className="mt-2.5 border-t-[3px] border-double border-ink pt-3">
              <div className="mb-1 text-[11px] uppercase tracking-[0.14em] text-ink-faint">Tempo estimado</div>
              <div className="text-[17px] font-bold text-ink">{goal.timeLabel}</div>
              <div className="mt-0.5 text-[12px] text-ink-faint">conclusão prevista: {completionLabel}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
