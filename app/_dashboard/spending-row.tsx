"use client";

import { useState, useTransition } from "react";
import { CalendarX2, Pencil, X } from "lucide-react";
import { toast } from "sonner";

import {
  deleteInstallmentsFromAction,
  deleteSpendingAction,
  restoreSpendingAction,
  restoreSpendingsAction,
} from "@/actions/spending.actions";
import { emitMonthDataUpdated } from "@/lib/month-events";
import { formatShortDate } from "@/lib/month";
import { formatCurrencyBRL } from "@/lib/utils";
import type { Spending } from "@/types/month";

import { RowActions } from "./row-actions";
import { SpendingForm } from "./spending-form";

interface SpendingRowProps {
  month: string;
  spending: Spending;
}

export function SpendingRow({ month, spending }: SpendingRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const installment = spending.installment;

  function handleRemove() {
    startTransition(async () => {
      try {
        await deleteSpendingAction(spending.id);
        emitMonthDataUpdated();
        toast(`Gasto de ${formatCurrencyBRL(spending.amount)} removido.`, {
          action: {
            label: "Desfazer",
            onClick: () => {
              restoreSpendingAction(spending.id).then(emitMonthDataUpdated);
            },
          },
        });
      } catch {
        toast.error("Não foi possível remover o gasto. Tente de novo.");
      }
    });
  }

  /** Remove esta parcela e as seguintes da mesma compra. */
  function handleRemoveRemaining(groupId: string, fromNumber: number) {
    startTransition(async () => {
      try {
        const ids = await deleteInstallmentsFromAction(groupId, fromNumber);
        emitMonthDataUpdated();
        toast(`${ids.length} ${ids.length === 1 ? "parcela removida" : "parcelas removidas"}.`, {
          action: {
            label: "Desfazer",
            onClick: () => {
              restoreSpendingsAction(ids).then(emitMonthDataUpdated);
            },
          },
        });
      } catch {
        toast.error("Não foi possível remover as parcelas. Tente de novo.");
      }
    });
  }

  if (isEditing) {
    return (
      <SpendingForm
        month={month}
        spending={spending}
        onDone={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="group flex items-center gap-3 border-b border-line/70 py-2 last:border-b-0">
      <span className="w-10 flex-none text-[12.5px] text-muted">{formatShortDate(spending.date)}</span>
      <p className="min-w-0 flex-1 truncate text-[14px]">
        <span className="font-medium text-ink">{spending.note || spending.category}</span>
        {spending.note && <span className="text-[12.5px] text-muted"> · {spending.category}</span>}
        {installment && (
          <span className="ml-1.5 rounded-full bg-sunken px-1.5 py-0.5 align-middle text-[11.5px] font-semibold text-muted">
            {installment.number}/{installment.total}
          </span>
        )}
      </p>
      <span className="money flex-none text-[15px] font-bold text-ink">{formatCurrencyBRL(spending.amount)}</span>
      <RowActions
        disabled={isPending}
        actions={[
          { icon: Pencil, label: `Editar gasto de ${spending.category}`, onClick: () => setIsEditing(true) },
          { icon: X, label: `Remover gasto de ${spending.category}`, onClick: handleRemove },
          ...(installment && installment.number < installment.total
            ? [
                {
                  icon: CalendarX2,
                  label: "Remover esta parcela e as seguintes",
                  onClick: () => handleRemoveRemaining(installment.groupId, installment.number),
                },
              ]
            : []),
        ]}
      />
    </div>
  );
}
