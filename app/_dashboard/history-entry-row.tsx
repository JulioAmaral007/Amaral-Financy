"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

import { deleteHistoryEntryAction, restoreHistoryEntryAction } from "@/actions/history.actions";
import { emitHistoryUpdated } from "@/lib/history-events";
import { PERSON_LABELS } from "@/lib/people";
import { formatCurrencyBRL } from "@/lib/utils";
import type { HistoryEntry } from "@/types/history";

import { EditHistoryEntryForm } from "./edit-history-entry-form";

interface HistoryEntryRowProps {
  entry: HistoryEntry;
}

export function HistoryEntryRow({ entry }: HistoryEntryRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  function handleRemove() {
    startTransition(async () => {
      try {
        await deleteHistoryEntryAction(entry.id);
        emitHistoryUpdated();
        toast("Divisão removida do histórico.", {
          action: {
            label: "Desfazer",
            onClick: () => {
              restoreHistoryEntryAction(entry.id).then(emitHistoryUpdated);
            },
          },
        });
      } catch {
        toast.error("Erro ao remover o cálculo. Tente novamente.");
      }
    });
  }

  function handleEditDone() {
    setIsEditing(false);
    emitHistoryUpdated();
  }

  if (isEditing) {
    return (
      <EditHistoryEntryForm entry={entry} onDone={handleEditDone} onCancel={() => setIsEditing(false)} />
    );
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-b border-dashed border-rule-faint py-2.5 text-[14px]">
      <span className="min-w-[52px] flex-none whitespace-nowrap text-[12px] text-ink-faint">
        {new Date(entry.calculatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
      </span>
      <span className="font-bold text-ink">{formatCurrencyBRL(entry.billAmount)}</span>
      <span className="leader hidden sm:block" />
      <div className="order-last flex w-full min-w-0 flex-wrap items-baseline gap-x-2.5 gap-y-1 sm:order-none sm:w-auto">
        <span className="text-[12px] text-ink-soft">{PERSON_LABELS.salary1} {formatCurrencyBRL(entry.salary1Payment)}</span>
        <span className="text-[12px] text-blue">{PERSON_LABELS.salary2} {formatCurrencyBRL(entry.salary2Payment)}</span>
        <span className="text-[12px] text-red">{PERSON_LABELS.salary3} {formatCurrencyBRL(entry.salary3Payment)}</span>
      </div>
      <div className="ml-auto flex flex-none items-center gap-2">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          disabled={isPending}
          className="px-1 py-1 text-ink-faint transition-colors hover:text-ink disabled:opacity-50"
          aria-label="Editar cálculo"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isPending}
          className="px-1 py-1 text-[17px] leading-none text-ink-faint transition-colors hover:text-ink disabled:opacity-50"
          aria-label="Remover cálculo do histórico"
        >
          ×
        </button>
      </div>
    </div>
  );
}
