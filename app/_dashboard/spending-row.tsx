"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { deleteSpendingAction, restoreSpendingAction } from "@/actions/spending.actions";
import { emitMonthDataUpdated } from "@/lib/month-events";
import { formatShortDate } from "@/lib/month";
import { formatCurrencyBRL } from "@/lib/utils";
import type { Spending } from "@/types/month";

import { SpendingForm } from "./spending-form";

interface SpendingRowProps {
  month: string;
  spending: Spending;
}

export function SpendingRow({ month, spending }: SpendingRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

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
        toast.error("Erro ao remover o gasto. Tente novamente.");
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
    <div className="flex items-center gap-3 border-b border-dashed border-rule-faint px-1 py-2.5">
      <span className="w-[42px] flex-none text-[12px] text-ink-faint">{formatShortDate(spending.date)}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-bold text-ink">{spending.category}</p>
        {spending.note && <p className="truncate text-[11.5px] text-ink-faint">{spending.note}</p>}
      </div>
      <div className="w-[100px] flex-none text-right text-[14px] font-bold text-ink">
        {formatCurrencyBRL(spending.amount)}
      </div>
      <div className="flex flex-none items-center gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={isPending}
          className="px-1 py-1 text-ink-faint transition-colors hover:text-ink disabled:opacity-50"
          aria-label={`Editar gasto de ${spending.category}`}
        >
          <Pencil className="h-[15px] w-[15px]" />
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="px-1 py-1 text-[17px] leading-none text-ink-faint transition-colors hover:text-ink disabled:opacity-50"
          aria-label={`Remover gasto de ${spending.category}`}
        >
          ×
        </button>
      </div>
    </div>
  );
}
