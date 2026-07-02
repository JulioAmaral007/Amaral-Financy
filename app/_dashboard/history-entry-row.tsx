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
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-2 rounded-[10px] border border-border/6 bg-input px-4 py-3">
      <span className="w-12 flex-none text-xs text-foreground/45">
        {new Date(entry.calculatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
      </span>
      <span className="flex-1 font-mono text-[13.5px] font-semibold text-foreground">
        {formatCurrencyBRL(entry.billAmount)}
      </span>
      <div className="flex flex-wrap gap-x-3.5 gap-y-1 font-mono text-[11.5px]">
        <span className="text-primary-soft">S1 {formatCurrencyBRL(entry.salary1Payment)}</span>
        <span className="text-blue-soft">S2 {formatCurrencyBRL(entry.salary2Payment)}</span>
        <span className="text-purple-soft">S3 {formatCurrencyBRL(entry.salary3Payment)}</span>
      </div>
      <button
        type="button"
        onClick={handleRemove}
        disabled={isPending}
        className="flex-none px-1.5 text-lg text-foreground/35 transition-colors hover:text-foreground/60 disabled:opacity-50"
        aria-label="Remover cálculo do histórico"
      >
        ×
      </button>
    </div>
  );
}
