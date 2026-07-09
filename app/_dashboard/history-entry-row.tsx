"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { deleteHistoryEntryAction } from "@/actions/history.actions";
import { formatCurrencyBRL } from "@/lib/utils";
import type { HistoryEntry } from "@/types/history";

interface HistoryEntryRowProps {
  entry: HistoryEntry;
  onChanged: () => void;
}

export function HistoryEntryRow({ entry, onChanged }: HistoryEntryRowProps) {
  const [isPending, startTransition] = useTransition();

  function handleRemove() {
    startTransition(async () => {
      try {
        await deleteHistoryEntryAction(entry.id);
        onChanged();
      } catch {
        toast.error("Erro ao remover o cálculo. Tente novamente.");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-b border-dashed border-rule-faint py-2.5 text-[14px]">
      <span className="w-[52px] flex-none text-[12px] text-ink-faint">
        {new Date(entry.calculatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
      </span>
      <span className="font-bold text-ink">{formatCurrencyBRL(entry.billAmount)}</span>
      <span className="leader hidden sm:block" />
      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <span className="text-[12px] text-ink-soft">S1 {formatCurrencyBRL(entry.salary1Payment)}</span>
        <span className="text-[12px] text-blue">S2 {formatCurrencyBRL(entry.salary2Payment)}</span>
        <span className="text-[12px] text-red">S3 {formatCurrencyBRL(entry.salary3Payment)}</span>
      </div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        className="ml-auto flex-none px-1.5 text-[17px] leading-none text-ink-faint transition-colors hover:text-ink disabled:opacity-50"
        aria-label="Remover cálculo do histórico"
      >
        ×
      </button>
    </div>
  );
}
