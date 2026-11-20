"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { ToggleCheck } from "@/components/ui/toggle-check";
import {
  deleteFixedBillAction,
  restoreFixedBillAction,
  toggleFixedBillIncludedAction,
} from "@/actions/fixed-bill.actions";
import { emitFixedBillsUpdated } from "@/lib/fixed-bill-events";
import { formatCurrencyBRL } from "@/lib/utils";
import type { FixedBillView } from "@/services/fixed-bill.service";

import { EditFixedBillForm } from "./edit-fixed-bill-form";

interface FixedBillRowProps {
  bill: FixedBillView;
}

export function FixedBillRow({ bill }: FixedBillRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  function handleToggleIncluded() {
    startTransition(async () => {
      try {
        await toggleFixedBillIncludedAction(bill.id, !bill.includedInBill);
        emitFixedBillsUpdated();
      } catch {
        toast.error("Erro ao atualizar a conta. Tente novamente.");
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      try {
        await deleteFixedBillAction(bill.id);
        emitFixedBillsUpdated();
        toast(`"${bill.name}" removida.`, {
          action: {
            label: "Desfazer",
            onClick: () => {
              restoreFixedBillAction(bill.id).then(emitFixedBillsUpdated);
            },
          },
        });
      } catch {
        toast.error("Erro ao remover a conta. Tente novamente.");
      }
    });
  }

  function handleEditDone() {
    setIsEditing(false);
    emitFixedBillsUpdated();
  }

  if (isEditing) {
    return (
      <EditFixedBillForm bill={bill} onDone={handleEditDone} onCancel={() => setIsEditing(false)} />
    );
  }

  return (
    <div className="flex items-center gap-3.5 border-b border-dashed border-rule-faint px-1 py-3">
      <ToggleCheck
        checked={bill.includedInBill}
        onClick={handleToggleIncluded}
        disabled={isPending}
        aria-label={`Somar ${bill.name} ao total do mês`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-bold text-ink">{bill.name}</p>
        <p className="text-[11.5px] uppercase tracking-[0.06em] text-ink-faint">
          {bill.category}
          {bill.payer !== "split" && <> · {bill.payerLabel}</>}
        </p>
      </div>
      {!bill.includedInBill && (
        <span className="inline-block whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.12em] text-red">
          Fora da soma
        </span>
      )}
      <div className="w-[110px] flex-none text-right text-[14.5px] font-bold text-ink">
        {formatCurrencyBRL(bill.amount)}
      </div>
      <div className="flex flex-none items-center gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={isPending}
          className="px-1 py-1 text-ink-faint transition-colors hover:text-ink disabled:opacity-50"
          aria-label={`Editar ${bill.name}`}
        >
          <Pencil className="h-[15px] w-[15px]" />
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="px-1 py-1 text-[17px] leading-none text-ink-faint transition-colors hover:text-ink disabled:opacity-50"
          aria-label={`Remover ${bill.name}`}
        >
          ×
        </button>
      </div>
    </div>
  );
}
