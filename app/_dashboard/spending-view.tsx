"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HatchBar, ReceiptTitle, SectionLabel, StarDivider } from "@/components/ui/receipt";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import * as monthService from "@/services/month.service";
import type { MonthSnapshot } from "@/services/month.service";
import type { SpendingCategory } from "@/types/month";

import { BudgetsForm } from "./budgets-form";
import { SpendingForm } from "./spending-form";
import { SpendingRow } from "./spending-row";

interface SpendingViewProps {
  snapshot: MonthSnapshot;
}

type CategoryFilter = SpendingCategory | "all";

export function SpendingView({ snapshot }: SpendingViewProps) {
  const { month, settings, spendings, totals } = snapshot;
  const [showAdd, setShowAdd] = useState(false);
  const [showBudgets, setShowBudgets] = useState(false);
  const [filter, setFilter] = useState<CategoryFilter>("all");

  const summary = monthService.summarizeSpendingByCategory(spendings, settings.budgets);
  const visible = filter === "all" ? spendings : spendings.filter((spending) => spending.category === filter);
  const totalBudget = summary.reduce((sum, item) => sum + item.budget, 0);

  return (
    <Card className="rotate-[0.2deg]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ReceiptTitle className="tracking-[0.1em]">GASTOS DO MÊS</ReceiptTitle>
          <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-ink-faint">
            cartão de crédito: <span className="font-bold text-ink">{formatCurrencyBRL(totals.spending)}</span>
            {totalBudget > 0 && <> de {formatCurrencyBRL(totalBudget)} estimados</>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowBudgets((prev) => !prev)}>
            Estimativas
          </Button>
          <Button onClick={() => setShowAdd((prev) => !prev)}>+ Lançar</Button>
        </div>
      </div>

      <StarDivider className="mb-3.5 mt-2.5" />

      {showBudgets && (
        <BudgetsForm
          month={month}
          budgets={settings.budgets}
          onDone={() => setShowBudgets(false)}
          onCancel={() => setShowBudgets(false)}
        />
      )}

      {showAdd && (
        <SpendingForm
          month={month}
          defaultCategory={filter === "all" ? undefined : filter}
          onDone={() => setShowAdd(false)}
          onCancel={() => setShowAdd(false)}
        />
      )}

      <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
        {summary.map((item) => {
          const over = item.budget > 0 && item.balance < 0;
          const pct = item.budget > 0 ? (item.spent / item.budget) * 100 : 0;
          return (
            <div key={item.category}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[13px] font-bold uppercase tracking-[0.1em] text-ink">{item.category}</span>
                <span className="text-[13px] font-bold text-ink">{formatCurrencyBRL(item.spent)}</span>
              </div>
              {item.budget > 0 ? (
                <>
                  <HatchBar pct={pct} className="my-1.5" />
                  <div className="flex items-baseline justify-between gap-3 text-[11.5px] uppercase tracking-[0.06em]">
                    <span className="text-ink-faint">estimado {formatCurrencyBRL(item.budget)}</span>
                    <span className={cn("font-bold", over ? "text-red" : "text-green")}>
                      {over ? "estourou " : "saldo "}
                      {formatCurrencyBRL(Math.abs(item.balance))}
                    </span>
                  </div>
                </>
              ) : (
                <p className="mt-1 text-[11.5px] uppercase tracking-[0.06em] text-ink-faint">sem estimativa</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 border-t-2 border-dashed border-rule-faint pt-4">
        <SectionLabel className="mb-2.5">Lançamentos</SectionLabel>
        <div className="mb-2 flex flex-wrap gap-2">
          {(["all", ...summary.map((item) => item.category)] as CategoryFilter[]).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={filter === option}
              onClick={() => setFilter(option)}
              className={cn(
                "cursor-pointer border-2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors",
                filter === option
                  ? "border-ink bg-ink text-paper"
                  : "border-rule text-ink-soft hover:border-ink hover:text-ink"
              )}
            >
              {option === "all" ? "Todos" : option}
            </button>
          ))}
        </div>

        <div className="flex flex-col">
          {visible.map((spending) => (
            <SpendingRow key={spending.id} month={month} spending={spending} />
          ))}
          {visible.length === 0 && (
            <p className="py-6 text-center text-[13px] text-ink-faint">Nenhum gasto lançado.</p>
          )}
        </div>
      </div>
    </Card>
  );
}
