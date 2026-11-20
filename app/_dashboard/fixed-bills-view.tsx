"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { copyPreviousMonthBillsAction } from "@/actions/fixed-bill.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { emitFixedBillsUpdated } from "@/lib/fixed-bill-events";
import { monthLabel, shiftMonth } from "@/lib/month";
import { formatCurrencyBRL } from "@/lib/utils";
import * as fixedBillService from "@/services/fixed-bill.service";
import type { FixedBillView } from "@/services/fixed-bill.service";

import { AddFixedBillForm } from "./add-fixed-bill-form";
import { FixedBillRow } from "./fixed-bill-row";

interface FixedBillsViewProps {
  month: string;
  bills: FixedBillView[];
  previousMonthBillCount: number;
}

export function FixedBillsView({ month, bills, previousMonthBillCount }: FixedBillsViewProps) {
  const [showAddBill, setShowAddBill] = useState(false);
  const [isCopying, startCopy] = useTransition();

  const total = bills.reduce((sum, bill) => sum + bill.amount, 0);
  const includedTotal = fixedBillService.sumIncludedFixedBills(bills);
  const previousLabel = monthLabel(shiftMonth(month, -1));

  function handleCopy() {
    startCopy(async () => {
      try {
        const copied = await copyPreviousMonthBillsAction(month);
        emitFixedBillsUpdated();
        toast.success(`${copied} contas copiadas de ${previousLabel}.`);
      } catch {
        toast.error("Erro ao copiar as contas. Tente novamente.");
      }
    });
  }

  return (
    <Card className="-rotate-[0.2deg]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <ReceiptTitle className="tracking-[0.1em]">CONTAS DO MÊS</ReceiptTitle>
          <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-ink-faint">
            somadas: <span className="font-bold text-ink">{formatCurrencyBRL(includedTotal)}</span>
            {total !== includedTotal && <> · todas: {formatCurrencyBRL(total)}</>}
          </p>
        </div>
        <Button onClick={() => setShowAddBill((prev) => !prev)}>+ Adicionar</Button>
      </div>

      <StarDivider className="mb-3.5 mt-2.5" />

      {showAddBill && (
        <AddFixedBillForm month={month} onDone={() => setShowAddBill(false)} onCancel={() => setShowAddBill(false)} />
      )}

      <div className="flex flex-col">
        {bills.map((bill) => (
          <FixedBillRow key={bill.id} bill={bill} />
        ))}
        {bills.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-[13px] text-ink-faint">Nenhuma conta neste mês.</p>
            {previousMonthBillCount > 0 && (
              <Button variant="outline" onClick={handleCopy} disabled={isCopying}>
                Copiar {previousMonthBillCount} contas de {previousLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
