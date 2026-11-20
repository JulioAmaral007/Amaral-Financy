"use client";

import { Card } from "@/components/ui/card";
import type { MonthSnapshot } from "@/services/month.service";

import { MonthTotalHeader } from "./month-total-header";

interface MonthSummaryCardProps {
  snapshot: MonthSnapshot;
  previousTotal: number;
}

/** Topo do mês para perfis sem divisão: só o total, sem INSS/Thais/Julio. */
export function MonthSummaryCard({ snapshot, previousTotal }: MonthSummaryCardProps) {
  return (
    <Card id="mes" className="p-5 sm:p-7">
      <MonthTotalHeader
        month={snapshot.month}
        totals={snapshot.totals}
        previousTotal={previousTotal}
        steps={[
          { todo: "lançar as contas", done: snapshot.bills.length > 0 },
          { todo: "lançar os gastos do cartão", done: snapshot.spendings.length > 0 },
        ]}
      />
    </Card>
  );
}
