"use client";

import { useState } from "react";
import { Flame, SlidersHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { cn, formatCurrencyBRL, round2 } from "@/lib/utils";
import * as monthService from "@/services/month.service";
import type { MonthSnapshot } from "@/services/month.service";
import type { SpendingCategory } from "@/types/month";

import { BudgetsForm } from "./budgets-form";
import { SpendingForm } from "./spending-form";
import { SpendingRow } from "./spending-row";

interface SpendingViewProps {
  snapshot: MonthSnapshot;
  /** Meses seguidos (antes deste) dentro do estimado. */
  streak: number;
}

type CategoryFilter = SpendingCategory | "all";

/** Lançamentos visíveis antes de "Ver todos": o resto fica a um clique, sem alongar a página. */
const LIST_LIMIT = 5;

export function SpendingView({ snapshot, streak }: SpendingViewProps) {
  const { month, settings, spendings, totals } = snapshot;
  const [showBudgets, setShowBudgets] = useState(false);
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [showAll, setShowAll] = useState(false);

  const summary = monthService.summarizeSpendingByCategory(spendings, settings.budgets);
  const visible = filter === "all" ? spendings : spendings.filter((spending) => spending.category === filter);
  const totalBudget = summary.reduce((sum, item) => sum + item.budget, 0);
  const left = round2(totalBudget - totals.spending);

  let subtitle: React.ReactNode = `${formatCurrencyBRL(totals.spending)} gastos`;
  if (totalBudget > 0) {
    subtitle =
      left >= 0 ? (
        <>
          {formatCurrencyBRL(totals.spending)} de {formatCurrencyBRL(totalBudget)} ·{" "}
          <span className="font-semibold text-good">sobram {formatCurrencyBRL(left)}</span>
        </>
      ) : (
        <>
          {formatCurrencyBRL(totals.spending)} de {formatCurrencyBRL(totalBudget)} ·{" "}
          <span className="font-semibold text-bad">passou {formatCurrencyBRL(-left)}</span>
        </>
      );
  }

  const shown = showAll ? visible : visible.slice(0, LIST_LIMIT);
  const hidden = visible.length - shown.length;

  return (
    <Card id="gastos" className="@container">
      <CardHeader title="Gastos do cartão" subtitle={subtitle}>
        {streak > 0 && (
          <Badge
            tone="good"
            className="py-0.5"
            title={streak === 1 ? "Mês passado ficou dentro do estimado" : `${streak} meses seguidos dentro do estimado`}
          >
            <Flame className="h-3.5 w-3.5" />
            {streak} {streak === 1 ? "mês" : "meses"} no estimado
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowBudgets((prev) => !prev)}
          aria-expanded={showBudgets}
          aria-label="Estimativas"
          title="Estimativas"
          className="px-2.5"
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>

      {showBudgets && (
        <BudgetsForm
          month={month}
          budgets={settings.budgets}
          onDone={() => setShowBudgets(false)}
          onCancel={() => setShowBudgets(false)}
        />
      )}

      {/* `key` faz a categoria do lançamento rápido acompanhar o filtro escolhido. */}
      <SpendingForm key={filter} month={month} defaultCategory={filter === "all" ? undefined : filter} />

      <div className="mt-4 grid grid-cols-2 gap-2 @xl:grid-cols-4">
        {summary.map((item) => {
          const over = item.budget > 0 && item.balance < 0;
          const pct = item.budget > 0 ? Math.min(100, (item.spent / item.budget) * 100) : 0;
          const selected = filter === item.category;
          return (
            <button
              key={item.category}
              type="button"
              aria-pressed={selected}
              onClick={() => setFilter(selected ? "all" : item.category)}
              className={cn(
                "min-w-0 cursor-pointer rounded-2xl px-3 py-2.5 text-left transition-all",
                selected ? "bg-ink text-on-ink" : "bg-sunken hover:bg-ink/5"
              )}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className={cn("truncate text-[12.5px] font-medium", selected ? "text-on-ink/70" : "text-muted")}>
                  {item.category}
                </span>
                <span
                  className={cn(
                    "flex-none text-[11.5px] font-semibold",
                    over ? (selected ? "text-julio" : "text-bad") : selected ? "text-on-ink/70" : "text-muted"
                  )}
                >
                  {item.budget > 0 && `${Math.round((item.spent / item.budget) * 100)}%`}
                </span>
              </span>
              <span className="money block truncate text-[16px] font-bold leading-tight">
                {formatCurrencyBRL(item.spent)}
              </span>
              {item.budget > 0 ? (
                <>
                  <div className={cn("mt-2 h-1.5 overflow-hidden rounded-full", selected ? "bg-on-ink/20" : "bg-ink/8")}>
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width] duration-700",
                        over ? "bg-bad" : selected ? "bg-on-ink" : "bg-ink"
                      )}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <p
                    className={cn(
                      "mt-1 truncate text-[11.5px] font-medium",
                      over ? (selected ? "text-julio" : "text-bad") : selected ? "text-on-ink/70" : "text-muted"
                    )}
                  >
                    {over
                      ? `passou ${formatCurrencyBRL(Math.abs(item.balance))}`
                      : `sobram ${formatCurrencyBRL(item.balance)}`}
                  </p>
                </>
              ) : (
                <p className={cn("mt-1.5 text-[11.5px]", selected ? "text-on-ink/60" : "text-faint")}>sem estimativa</p>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-muted">
            {filter === "all" ? "Lançamentos" : `Lançamentos · ${filter}`}
          </h3>
          {filter !== "all" && (
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="cursor-pointer text-[13px] font-semibold text-thais hover:underline"
            >
              Mostrar todos
            </button>
          )}
        </div>
        <div className="flex flex-col">
          {shown.map((spending) => (
            <SpendingRow key={spending.id} month={month} spending={spending} />
          ))}
          {visible.length === 0 && (
            <p className="py-5 text-center text-[13.5px] text-muted">
              {filter === "all" ? "Nenhum gasto ainda. Lance o primeiro aí em cima." : `Nada em ${filter} este mês.`}
            </p>
          )}
        </div>
        {(hidden > 0 || showAll) && visible.length > LIST_LIMIT && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="mt-1 w-full cursor-pointer rounded-xl py-2 text-[13px] font-semibold text-thais transition-colors hover:bg-thais/8"
          >
            {showAll ? "Mostrar menos" : `Ver todos (${visible.length})`}
          </button>
        )}
      </div>
    </Card>
  );
}
