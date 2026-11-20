"use client";

import { useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { toast } from "sonner";

import { ToggleCheck } from "@/components/ui/toggle-check";
import {
  deleteFixedBillAction,
  restoreFixedBillAction,
  toggleFixedBillIncludedAction,
} from "@/actions/fixed-bill.actions";
import { emitFixedBillsUpdated } from "@/lib/fixed-bill-events";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { FixedBillView } from "@/services/fixed-bill.service";

import { EditFixedBillForm } from "./edit-fixed-bill-form";
import { PERSON_COLORS } from "./people-colors";
import { RowActions } from "./row-actions";

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
        toast.error("Não foi possível atualizar a conta. Tente de novo.");
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
        toast.error("Não foi possível remover a conta. Tente de novo.");
      }
    });
  }

  function handleEditDone() {
    setIsEditing(false);
    emitFixedBillsUpdated();
  }

  if (isEditing) {
    return <EditFixedBillForm bill={bill} onDone={handleEditDone} onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="group flex items-center gap-3 border-b border-line/70 py-2 last:border-b-0">
      <ToggleCheck
        checked={bill.includedInBill}
        onClick={handleToggleIncluded}
        disabled={isPending}
        aria-label={`Somar ${bill.name} ao total do mês`}
      />
      <p
        className={cn(
          "flex min-w-0 flex-1 items-center gap-1.5 text-[14px] transition-opacity",
          !bill.includedInBill && "opacity-45"
        )}
      >
        <span className="truncate font-medium text-ink">{bill.name}</span>
        <span className="hidden flex-none text-[12.5px] text-muted min-[400px]:inline">· {bill.category}</span>
        {bill.payer !== "split" && (
          <span className="flex flex-none items-center gap-1 text-[12.5px] text-muted">
            <span className={cn("h-1.5 w-1.5 rounded-full", PERSON_COLORS[bill.payer].dot)} />
            {bill.payerLabel}
          </span>
        )}
      </p>
      <span
        className={cn(
          "money flex-none text-[15px] font-bold",
          bill.includedInBill ? "text-ink" : "text-faint line-through decoration-2"
        )}
      >
        {formatCurrencyBRL(bill.amount)}
      </span>
      <RowActions
        disabled={isPending}
        actions={[
          { icon: Pencil, label: `Editar ${bill.name}`, onClick: () => setIsEditing(true) },
          { icon: X, label: `Remover ${bill.name}`, onClick: handleRemove },
        ]}
      />
    </div>
  );
}
