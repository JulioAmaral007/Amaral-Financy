"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { ToggleCheck } from "@/components/ui/toggle-check";
import { deleteFixedBillAction, toggleFixedBillPaidAction } from "@/actions/fixed-bill.actions";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { FixedBillStatus } from "@/types/fixed-bill";
import type { FixedBillView } from "@/services/fixed-bill.service";

interface FixedBillRowProps {
  bill: FixedBillView;
  onChanged: () => void;
}

const STATUS_STAMP: Record<FixedBillStatus, string> = {
  overdue: "-rotate-3 rounded-[4px] border-2 border-red px-2 py-0.5 text-red opacity-85",
  upcoming: "-rotate-3 rounded-[4px] border-2 border-ink-soft px-2 py-0.5 text-ink-soft opacity-85",
  ok: "text-ink-faint",
};

const STATUS_LABEL: Record<FixedBillStatus, string> = {
  overdue: "Atrasada",
  upcoming: "Vence logo",
  ok: "pendente",
};

export function FixedBillRow({ bill, onChanged }: FixedBillRowProps) {
  const [isPending, startTransition] = useTransition();

  const stampClass = bill.isPaid
    ? "-rotate-3 rounded-[4px] border-2 border-red px-2 py-0.5 text-red opacity-85"
    : STATUS_STAMP[bill.status];
  const statusLabel = bill.isPaid ? "Pago" : STATUS_LABEL[bill.status];

  function handleTogglePaid() {
    startTransition(async () => {
      try {
        await toggleFixedBillPaidAction(bill.id, !bill.isPaid);
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
        onChanged();
      } catch {
        toast.error("Erro ao remover a conta. Tente novamente.");
      }
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3.5 border-b border-dashed border-rule-faint px-1 py-3",
        !bill.isPaid && bill.status === "overdue" && "bg-red-soft"
      )}
    >
      <ToggleCheck
        checked={bill.isPaid}
        onClick={handleTogglePaid}
        disabled={isPending}
        aria-label={`Marcar ${bill.name} como pago`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-bold text-ink">{bill.name}</p>
        <p className="text-[11.5px] uppercase tracking-[0.06em] text-ink-faint">
          {bill.category} · todo dia {bill.dueDay} · {bill.payerLabel}
        </p>
      </div>
      <span
        className={cn(
          "inline-block whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.12em]",
          stampClass
        )}
      >
        {statusLabel}
      </span>
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
