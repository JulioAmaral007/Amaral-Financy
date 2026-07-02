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

const STATUS_BORDER: Record<FixedBillStatus, string> = {
  overdue: "border-danger/40",
  upcoming: "border-amber/40",
  ok: "border-border/6",
};

const STATUS_LABEL: Record<FixedBillStatus, string> = {
  overdue: "Atrasada",
  upcoming: "Vence em breve",
  ok: "Pendente",
};

export function FixedBillRow({ bill, onChanged }: FixedBillRowProps) {
  const [isPending, startTransition] = useTransition();

  const borderClass = bill.isPaid ? "border-border/6" : STATUS_BORDER[bill.status];
  const statusLabel = bill.isPaid ? "Pago este mês" : STATUS_LABEL[bill.status];

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
    <div className={cn("flex items-center gap-3.5 rounded-xl border bg-input px-4 py-3.5", borderClass)}>
      <ToggleCheck
        checked={bill.isPaid}
        onClick={handleTogglePaid}
        disabled={isPending}
        aria-label={`Marcar ${bill.name} como pago`}
      />
      <div className="min-w-0 flex-1">
        <p className="text-[14.5px] font-semibold text-foreground">{bill.name}</p>
        <p className="text-xs text-foreground/50">
          {bill.category} · Todo dia {bill.dueDay} · {bill.payerLabel}
        </p>
      </div>
      <div className="flex-none text-right">
        <p className="font-mono text-[14.5px] font-bold text-foreground">{formatCurrencyBRL(bill.amount)}</p>
        <p className="text-[11.5px] text-foreground/45">{statusLabel}</p>
      </div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        className="flex-none px-1.5 text-lg text-foreground/35 transition-colors hover:text-foreground/60 disabled:opacity-50"
        aria-label={`Remover ${bill.name}`}
      >
        ×
      </button>
    </div>
  );
}
