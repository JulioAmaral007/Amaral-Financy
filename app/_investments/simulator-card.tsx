"use client";

import { useState } from "react";

import { Card } from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { cn, formatCurrencyBRL, formatPercent, parseCurrencyInput, parseDecimalInput } from "@/lib/utils";
import { resolveAnnualRatePct, simulateContributions } from "@/services/investment-math.service";
import type { SimulationRateMode } from "@/types/investment";

import { AreaChart } from "./area-chart";

interface SimulatorCardProps {
  initialValue: number;
  cdiBaseRate: number;
}

const MAX_YEARS = 50;

export function SimulatorCard({ initialValue, cdiBaseRate }: SimulatorCardProps) {
  const [initial, setInitial] = useState(initialValue ? String(Math.round(initialValue * 100)) : "");
  const [monthly, setMonthly] = useState("");
  const [years, setYears] = useState("10");
  const [rateMode, setRateMode] = useState<SimulationRateMode>("cdi");
  const [cdiPercent, setCdiPercent] = useState("100");
  const [fixedAnnualRate, setFixedAnnualRate] = useState("10");

  const parsedYears = Math.min(MAX_YEARS, Math.max(1, parseDecimalInput(years) || 1));
  const annualRatePct = resolveAnnualRatePct(
    rateMode,
    parseDecimalInput(cdiPercent),
    parseDecimalInput(fixedAnnualRate),
    cdiBaseRate
  );

  const simulation = simulateContributions({
    initialValue: parseCurrencyInput(initial),
    monthlyContribution: parseCurrencyInput(monthly),
    years: parsedYears,
    annualRatePct,
  });

  const yearsLabel = `${parsedYears} ${parsedYears === 1 ? "ano" : "anos"}`;

  return (
    <Card className="rotate-[0.15deg]">
      <ReceiptTitle className="text-[18px] tracking-[0.08em] sm:text-[22px]">SIMULADOR DE APORTES</ReceiptTitle>
      <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-ink-faint">
        juros compostos · projeção do patrimônio
      </p>

      <StarDivider className="mb-[18px] mt-2.5" />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_1.25fr] lg:gap-9">
        <div>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="sim-initial" className="mb-0.5 block text-[11px] uppercase tracking-[0.2em] text-ink-soft">
                Valor inicial
              </label>
              <CurrencyInput id="sim-initial" value={initial} onValueChange={setInitial} />
            </div>
            <div>
              <label htmlFor="sim-monthly" className="mb-0.5 block text-[11px] uppercase tracking-[0.2em] text-ink-soft">
                Aporte mensal
              </label>
              <CurrencyInput id="sim-monthly" value={monthly} onValueChange={setMonthly} />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="sim-years" className="mb-0.5 block text-[11px] uppercase tracking-[0.2em] text-ink-soft">
              Prazo (anos)
            </label>
            <Input
              id="sim-years"
              inputMode="numeric"
              value={years}
              onChange={(event) => setYears(event.target.value.replace(/\D/g, "").slice(0, 2))}
            />
          </div>

          <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-ink-soft">Rendimento</div>
          <div className="mb-3 flex gap-2">
            <button
              type="button"
              onClick={() => setRateMode("cdi")}
              aria-pressed={rateMode === "cdi"}
              className={cn(
                "flex-1 cursor-pointer border-2 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.12em] transition-colors",
                rateMode === "cdi" ? "border-ink bg-ink text-paper" : "border-rule bg-transparent text-ink-soft hover:text-ink"
              )}
            >
              % do CDI
            </button>
            <button
              type="button"
              onClick={() => setRateMode("fixed")}
              aria-pressed={rateMode === "fixed"}
              className={cn(
                "flex-1 cursor-pointer border-2 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.12em] transition-colors",
                rateMode === "fixed" ? "border-ink bg-ink text-paper" : "border-rule bg-transparent text-ink-soft hover:text-ink"
              )}
            >
              Taxa fixa
            </button>
          </div>

          {rateMode === "cdi" ? (
            <div>
              <label htmlFor="sim-cdi" className="sr-only">
                Percentual do CDI
              </label>
              <Input
                id="sim-cdi"
                inputMode="decimal"
                placeholder="100"
                value={cdiPercent}
                onChange={(event) => setCdiPercent(event.target.value)}
              />
              <p className="mt-2 text-[12px] text-ink-faint">
                ≈ {formatPercent(annualRatePct)} ao ano (CDI {cdiBaseRate}%)
              </p>
            </div>
          ) : (
            <div>
              <label htmlFor="sim-fixed" className="sr-only">
                Taxa fixa anual
              </label>
              <Input
                id="sim-fixed"
                inputMode="decimal"
                placeholder="10"
                value={fixedAnnualRate}
                onChange={(event) => setFixedAnnualRate(event.target.value)}
              />
              <p className="mt-2 text-[12px] text-ink-faint">taxa fixa de {formatPercent(annualRatePct)} ao ano</p>
            </div>
          )}
        </div>

        <div>
          <AreaChart values={simulation.path} startLabel="HOJE" endLabel={yearsLabel} />

          <div className="mt-3.5 grid grid-cols-1 border-t-2 border-dashed border-rule-faint pt-3.5 sm:grid-cols-3">
            <div className="border-b-2 border-dashed border-rule-faint py-2 sm:border-b-0 sm:border-r-2 sm:py-0 sm:pr-3.5">
              <div className="mb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Patrimônio final</div>
              <div className="break-words text-[17px] font-bold text-ink sm:text-[18px]">
                {formatCurrencyBRL(simulation.finalValue)}
              </div>
            </div>
            <div className="border-b-2 border-dashed border-rule-faint py-2 sm:border-b-0 sm:border-r-2 sm:px-3.5 sm:py-0">
              <div className="mb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Total aportado</div>
              <div className="break-words text-[17px] font-bold text-ink-soft sm:text-[18px]">
                {formatCurrencyBRL(simulation.totalContributed)}
              </div>
            </div>
            <div className="py-2 sm:pl-3.5 sm:py-0">
              <div className="mb-1 text-[10.5px] uppercase tracking-[0.14em] text-ink-faint">Juros ganhos</div>
              <div className="break-words text-[17px] font-bold text-blue sm:text-[18px]">
                {formatCurrencyBRL(simulation.totalInterest)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
