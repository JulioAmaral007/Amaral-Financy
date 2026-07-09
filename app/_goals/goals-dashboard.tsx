"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteGoalAction } from "@/actions/goal.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { cn } from "@/lib/utils";
import { getGoalsDashboardStats } from "@/services/goal-math.service";
import type { GoalView } from "@/services/goal.service";

import { GoalCard } from "./goal-card";

type SortKey = "prazo" | "valor" | "progresso" | "prioridade";

const PRIORITY_RANK: Record<GoalView["priority"], number> = { alta: 3, media: 2, baixa: 1 };

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "prazo", label: "Prazo" },
  { key: "valor", label: "Valor" },
  { key: "progresso", label: "Progresso" },
  { key: "prioridade", label: "Prioridade" },
];

interface GoalsDashboardProps {
  goals: GoalView[];
  onOpenGoal: (id: string) => void;
  onNewGoal: () => void;
  onDeleted: () => void;
}

export function GoalsDashboard({ goals, onOpenGoal, onNewGoal, onDeleted }: GoalsDashboardProps) {
  const [sort, setSort] = useState<SortKey>("prazo");
  const [, startTransition] = useTransition();

  const stats = getGoalsDashboardStats(goals);

  const sorted = [...goals].sort((a, b) => {
    if (sort === "valor") return b.targetValue - a.targetValue;
    if (sort === "progresso") return b.sim.progressPct - a.sim.progressPct;
    if (sort === "prioridade") return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
    return (a.sim.monthsToGoal ?? Infinity) - (b.sim.monthsToGoal ?? Infinity);
  });

  function handleRemove(id: string) {
    startTransition(async () => {
      const result = await deleteGoalAction({ id });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      onDeleted();
    });
  }

  return (
    <Card className="rotate-[0.25deg]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ReceiptTitle className="text-[26px] tracking-[0.09em]">METAS FINANCEIRAS</ReceiptTitle>
          <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-ink-faint">
            evolução patrimonial e tempo até cada objetivo
          </p>
        </div>
        <Button onClick={onNewGoal}>+ Nova meta</Button>
      </div>

      <StarDivider className="mb-4 mt-2.5" />

      <div className="mb-5 grid grid-cols-2 lg:grid-cols-4">
        <div className="border-r-2 border-dashed border-rule-faint py-1.5 pr-4">
          <div className="mb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Reservado</div>
          <div className="text-[17px] font-bold text-ink">{stats.totalCurrentFormatted}</div>
        </div>
        <div className="border-r-2 border-dashed border-rule-faint px-4 py-1.5">
          <div className="mb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Projetado</div>
          <div className="text-[17px] font-bold text-blue">{stats.totalProjectedFormatted}</div>
        </div>
        <div className="border-r-2 border-dashed border-rule-faint px-4 py-1.5">
          <div className="mb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Concluídas</div>
          <div className="text-[17px] font-bold text-ink">{stats.completedLabel}</div>
        </div>
        <div className="py-1.5 pl-4">
          <div className="mb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Próxima</div>
          <div className="text-[14px] font-bold text-ink">{stats.nextGoalLabel}</div>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap items-baseline gap-4 border-t-2 border-dashed border-rule-faint pt-3.5">
        <span className="text-[11px] uppercase tracking-[0.14em] text-ink-faint">ordenar por</span>
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setSort(option.key)}
            className={cn(
              "cursor-pointer text-[12px] uppercase tracking-[0.1em]",
              sort === option.key
                ? "font-bold text-ink underline decoration-red decoration-wavy underline-offset-4"
                : "font-normal text-ink-faint hover:text-ink"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <div className="mt-2 border-2 border-dashed border-rule py-9 text-center text-[13.5px] text-ink-faint">
          Nenhuma meta anotada ainda. Aperte &quot;+ Nova meta&quot; para começar.
        </div>
      ) : (
        <div className="flex flex-col">
          {sorted.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onOpen={() => onOpenGoal(goal.id)}
              onRemove={() => handleRemove(goal.id)}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
