"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { ToggleCheck } from "@/components/ui/toggle-check";
import { deleteFixedBillAction, toggleFixedBillIncludedAction } from "@/actions/fixed-bill.actions";
import { emitFixedBillsUpdated } from "@/lib/fixed-bill-events";
import { formatCurrencyBRL } from "@/lib/utils";
import type { FixedBillView } from "@/services/fixed-bill.service";

interface FixedBillRowProps {
  bill: FixedBillView;
  onChanged: () => void;
}

export function FixedBillRow({ bill, onChanged }: FixedBillRowProps) {
  const [isPending, startTransition] = useTransition();

  function handleToggleIncluded() {
    startTransition(async () => {
      try {
        await toggleFixedBillIncludedAction(bill.id, !bill.includedInBill);
        emitFixedBillsUpdated();
        onChanged();
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
        onChanged();
      } catch {
        toast.error("Erro ao remover a conta. Tente novamente.");
      }
    });
  }

  return (
    <div className="flex items-center gap-3.5 border-b border-dashed border-rule-faint px-1 py-3">
      <ToggleCheck
        checked={bill.includedInBill}
        onClick={handleToggleIncluded}
        disabled={isPending}
        aria-label={`Somar ${bill.name} ao valor da conta`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-bold text-ink">{bill.name}</p>
        <p className="text-[11.5px] uppercase tracking-[0.06em] text-ink-faint">
          {bill.category} · {bill.payerLabel}
        </p>
      </div>
      {bill.includedInBill && (
        <span className="inline-block whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.12em] text-ink-faint">
          Somado
        </span>
      )}
      <div className="w-[110px] flex-none text-right text-[14.5px] font-bold text-ink">
        {formatCurrencyBRL(bill.amount)}
      </div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        className="flex-none px-1.5 text-[17px] leading-none text-ink-faint transition-colors hover:text-ink disabled:opacity-50"
        aria-label={`Remover ${bill.name}`}
      >
        ×
      </button>
    </div>
  );
}
