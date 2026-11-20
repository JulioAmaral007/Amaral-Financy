"use client";

import { useState, useTransition } from "react";
import { Copy, Plus } from "lucide-react";
import { toast } from "sonner";

import { copyPreviousMonthBillsAction } from "@/actions/fixed-bill.actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { emitFixedBillsUpdated } from "@/lib/fixed-bill-events";
import { MONTH_NAMES, parseMonthKey, shiftMonth } from "@/lib/month";
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
  const includedCount = bills.filter((bill) => bill.includedInBill).length;
  const previousName = MONTH_NAMES[parseMonthKey(shiftMonth(month, -1)).monthIndex].toLowerCase();

  function handleCopy() {
    startCopy(async () => {
      try {
        const copied = await copyPreviousMonthBillsAction(month);
        emitFixedBillsUpdated();
        toast.success(`${copied} contas copiadas de ${previousName}.`);
      } catch {
        toast.error("Não foi possível copiar as contas. Tente de novo.");
      }
    });
  }

  const subtitle =
    bills.length === 0
      ? "Água, luz, internet, plano de saúde…"
      : includedCount === bills.length
        ? `${formatCurrencyBRL(includedTotal)} em ${bills.length} ${bills.length === 1 ? "conta" : "contas"} · desmarque para tirar do total`
        : `${formatCurrencyBRL(includedTotal)} somadas · ${formatCurrencyBRL(total - includedTotal)} de fora`;

  return (
    <Card id="contas">
      <CardHeader title="Contas do mês" subtitle={subtitle}>
        {!showAddBill && (
          <Button size="sm" variant="outline" onClick={() => setShowAddBill(true)}>
            <Plus className="h-4 w-4" /> Nova conta
          </Button>
        )}
      </CardHeader>

      {showAddBill && (
        <AddFixedBillForm month={month} onDone={() => setShowAddBill(false)} onCancel={() => setShowAddBill(false)} />
      )}

      <div className="flex flex-col">
        {bills.map((bill) => (
          <FixedBillRow key={bill.id} bill={bill} />
        ))}
        {bills.length === 0 && !showAddBill && (
          <div className="flex flex-col items-center gap-3 rounded-[22px] border-2 border-dashed border-ink/10 px-4 py-5 text-center">
            <p className="text-[14px] text-muted">Nenhuma conta neste mês ainda.</p>
            {previousMonthBillCount > 0 ? (
              <Button onClick={handleCopy} disabled={isCopying}>
                <Copy className="h-4 w-4" /> Copiar as {previousMonthBillCount} contas de {previousName}
              </Button>
            ) : (
              <Button onClick={() => setShowAddBill(true)}>
                <Plus className="h-4 w-4" /> Adicionar a primeira
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
