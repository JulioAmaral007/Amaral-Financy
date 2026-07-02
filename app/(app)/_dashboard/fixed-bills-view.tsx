"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrencyBRL } from "@/lib/utils";
import type { FixedBillView } from "@/services/fixed-bill.service";

import { AddFixedBillForm } from "./add-fixed-bill-form";
import { FixedBillAlerts } from "./fixed-bill-alerts";
import { FixedBillRow } from "./fixed-bill-row";

interface FixedBillsViewProps {
  bills: FixedBillView[];
  alerts: FixedBillView[];
  total: number;
  page: number;
  totalPages: number;
  onChanged: () => void;
}

export function FixedBillsView({ bills, alerts, total, page, totalPages, onChanged }: FixedBillsViewProps) {
  const [showAddBill, setShowAddBill] = useState(false);

  function handleAddDone() {
    setShowAddBill(false);
    onChanged();
  }

  return (
    <div>
      <FixedBillAlerts alerts={alerts} />

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[30px] text-foreground">Contas Fixas</h2>
          <p className="mt-1 text-[13.5px] text-foreground/60">Total mensal: {formatCurrencyBRL(total)}</p>
        </div>
        <Button onClick={() => setShowAddBill((prev) => !prev)}>+ Adicionar</Button>
      </div>

      {showAddBill && (
        <AddFixedBillForm onDone={handleAddDone} onCancel={() => setShowAddBill(false)} />
      )}

      <div className="flex flex-col gap-2.5">
        {bills.map((bill) => (
          <FixedBillRow key={bill.id} bill={bill} onChanged={onChanged} />
        ))}
        {bills.length === 0 && (
          <p className="py-8 text-center text-sm text-foreground/45">Nenhuma conta fixa cadastrada.</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} paramName="fixedBillsPage" />
    </div>
  );
}
