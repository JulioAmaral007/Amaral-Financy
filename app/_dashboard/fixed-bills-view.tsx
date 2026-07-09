"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
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
    <Card className="-rotate-[0.2deg]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ReceiptTitle className="tracking-[0.1em]">CONTAS FIXAS</ReceiptTitle>
          <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-ink-faint">
            total mensal: <span className="font-bold text-ink">{formatCurrencyBRL(total)}</span>
          </p>
        </div>
        <Button onClick={() => setShowAddBill((prev) => !prev)}>+ Adicionar</Button>
      </div>

      <StarDivider className="mb-3.5 mt-2.5" />

      <FixedBillAlerts alerts={alerts} />

      {showAddBill && <AddFixedBillForm onDone={handleAddDone} onCancel={() => setShowAddBill(false)} />}

      <div className="flex flex-col">
        {bills.map((bill) => (
          <FixedBillRow key={bill.id} bill={bill} onChanged={onChanged} />
        ))}
        {bills.length === 0 && (
          <p className="py-8 text-center text-[13px] text-ink-faint">Nenhuma conta fixa cadastrada.</p>
        )}
      </div>

      <Pagination page={page} totalPages={totalPages} paramName="fixedBillsPage" />
    </Card>
  );
}
