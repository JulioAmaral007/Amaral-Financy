"use client";

import { useTransition } from "react";

import { closePjCycleAction } from "@/actions/pj.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HatchBar, ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { cn, formatCurrencyBRL, formatPercent } from "@/lib/utils";
import { parseISODateLocal } from "@/lib/date";
import { journeyHoursOf } from "@/services/pj-math.service";
import type { ActiveCycleView } from "@/services/pj.service";

import { PjDayRow } from "./pj-day-row";

interface PjDashboardProps {
  activeCycle: ActiveCycleView;
  onOpenConfig: () => void;
  onOpenHistory: () => void;
  onChanged: () => void;
}

function round1(value: number): string {
  return (Math.round(value * 10) / 10).toString();
}

export function PjDashboard({ activeCycle, onOpenConfig, onOpenHistory, onChanged }: PjDashboardProps) {
  const { cycle, days, summary } = activeCycle;
  const [isClosing, startClosing] = useTransition();

  const periodLabel = `${parseISODateLocal(cycle.startDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })} – ${parseISODateLocal(cycle.endDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
  const journeyLabel = `${journeyHoursOf(cycle)}h/dia`;
  const diffPositive = summary.diff >= 0;

  function handleCloseCycle() {
    startClosing(async () => {
      await closePjCycleAction();
      onChanged();
    });
  }

  const remainingHours = Math.max(0, summary.predictedHours - summary.workedHours);

  return (
    <Card className="-rotate-[0.25deg]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ReceiptTitle className="text-[21px] tracking-[0.09em] sm:text-[27px]">FOLHA DE PONTO — PJ</ReceiptTitle>
          <p className="mt-0.5 text-[12px] uppercase tracking-[0.08em] text-ink-faint">
            {periodLabel} · {journeyLabel} · {formatCurrencyBRL(cycle.hourlyRate)}/h
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button variant="outline" onClick={onOpenHistory} className="px-3.5 py-2 text-[11.5px]">
            Histórico
          </Button>
          <Button variant="outline" onClick={onOpenConfig} className="px-3.5 py-2 text-[11.5px]">
            Configurar ciclo
          </Button>
          <Button variant="danger" onClick={handleCloseCycle} disabled={isClosing} className="px-3.5 py-2 text-[11.5px]">
            Encerrar ciclo
          </Button>
        </div>
      </div>

      <StarDivider className="mb-4 mt-2.5" />

      <div className="mb-4 grid grid-cols-1 sm:grid-cols-3">
        <div className="border-b-2 border-dashed border-rule-faint py-2 sm:border-b-0 sm:border-r-2 sm:pr-4">
          <div className="mb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Previsto inicialmente</div>
          <div className="text-[22px] font-bold text-ink">{formatCurrencyBRL(summary.predictedValue)}</div>
        </div>
        <div className="border-b-2 border-dashed border-rule-faint py-2 sm:border-b-0 sm:border-r-2 sm:px-4">
          <div className="mb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Atualizado até agora</div>
          <div className="text-[22px] font-bold text-blue">{formatCurrencyBRL(summary.updatedValue)}</div>
        </div>
        <div className="flex flex-col items-start gap-1 py-2 sm:pl-4">
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Diferença</div>
          <span
            className={cn(
              "inline-block -rotate-3 rounded-[4px] border-2 px-2 py-0.5 text-[14px] font-bold opacity-85",
              diffPositive ? "border-blue text-blue" : "border-red text-red"
            )}
          >
            {diffPositive ? "+" : ""}
            {formatCurrencyBRL(summary.diff)}
          </span>
        </div>
      </div>

      <div className="mb-[18px] border-y-2 border-dashed border-rule-faint py-2.5 text-[13px] text-ink-soft">
        {summary.total} dias úteis · {summary.doneCount} concluídos · {summary.pendingCount} restantes ···{" "}
        {round1(summary.predictedHours)}h previstas · {round1(summary.workedHours)}h trabalhadas ·{" "}
        {round1(remainingHours)}h restantes · média {round1(summary.avgDaily)}h/dia
      </div>

      <div className="mb-[18px] grid grid-cols-1 gap-7 sm:grid-cols-2">
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">Progresso do ciclo</span>
            <span className="text-[13px] font-bold text-ink">{formatPercent(summary.cyclePct)}</span>
          </div>
          <HatchBar pct={summary.cyclePct} />
        </div>
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-soft">Progresso das horas</span>
            <span className="text-[13px] font-bold text-ink">{formatPercent(summary.hoursPct)}</span>
          </div>
          <HatchBar pct={summary.hoursPct} />
        </div>
      </div>

      <div className="mb-[22px] grid grid-cols-1 gap-7 sm:grid-cols-2">
        <div className="flex items-baseline justify-between gap-2.5 border-[3px] border-double border-ink px-4 py-3">
          <span className="text-[12px] uppercase tracking-[0.08em] text-ink-soft">Garantido (dias feitos)</span>
          <span className="text-[17px] font-bold text-ink">{formatCurrencyBRL(summary.guaranteedValue)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-2.5 border-[1.5px] border-dashed border-rule px-4 py-3">
          <span className="text-[12px] uppercase tracking-[0.08em] text-ink-soft">Projetado (pendentes)</span>
          <span className="text-[17px] font-bold text-ink">{formatCurrencyBRL(summary.projectedValue)}</span>
        </div>
      </div>

      <div className="mb-0.5 flex items-baseline border-b-[2.5px] border-ink pb-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-ink-soft">
        <span className="w-9 flex-none">OK</span>
        <span className="w-[72px] flex-none sm:w-[88px]">Data</span>
        <span className="w-[52px] flex-none sm:w-[72px]">Horas</span>
        <span className="flex-1" />
        <span className="w-[64px] flex-none text-right sm:w-[90px]">Registro</span>
      </div>
      <div className="flex flex-col">
        {days.map((day) => (
          <PjDayRow key={day.id} day={day} journeyMode={cycle.journeyMode} onChanged={onChanged} />
        ))}
      </div>
    </Card>
  );
}
