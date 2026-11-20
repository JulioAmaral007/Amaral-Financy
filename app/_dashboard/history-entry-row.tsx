"use client";

import { useState, useTransition } from "react";
import { Pencil, X } from "lucide-react";
import { toast } from "sonner";

import { deleteHistoryEntryAction, restoreHistoryEntryAction } from "@/actions/history.actions";
import { emitHistoryUpdated } from "@/lib/history-events";
import { PERSON_LABELS } from "@/lib/people";
import { cn, formatCurrencyBRL } from "@/lib/utils";
import type { HistoryEntry } from "@/types/history";

import { EditHistoryEntryForm } from "./edit-history-entry-form";
import { PERSON_COLORS, type PersonKey } from "./people-colors";
import { RowActions } from "./row-actions";

interface HistoryEntryRowProps {
  entry: HistoryEntry;
}

const PEOPLE: Array<{ key: PersonKey; field: "salary1Payment" | "salary2Payment" | "salary3Payment" }> = [
  { key: "salary1", field: "salary1Payment" },
  { key: "salary2", field: "salary2Payment" },
  { key: "salary3", field: "salary3Payment" },
];

export function HistoryEntryRow({ entry }: HistoryEntryRowProps) {
  const [isPending, startTransition] = useTransition();
  const [isEditing, setIsEditing] = useState(false);

  function handleRemove() {
    startTransition(async () => {
      try {
        await deleteHistoryEntryAction(entry.id);
        emitHistoryUpdated();
        toast("Divisão removida.", {
          action: {
            label: "Desfazer",
            onClick: () => {
              restoreHistoryEntryAction(entry.id).then(emitHistoryUpdated);
            },
          },
        });
      } catch {
        toast.error("Não foi possível remover a divisão. Tente de novo.");
      }
    });
  }

  function handleEditDone() {
    setIsEditing(false);
    emitHistoryUpdated();
  }

  if (isEditing) {
    return <EditHistoryEntryForm entry={entry} onDone={handleEditDone} onCancel={() => setIsEditing(false)} />;
  }

  const total = entry.billAmount || 1;

  return (
    <div className="group flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line/70 py-3 last:border-b-0 sm:flex-nowrap">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:w-44 sm:flex-none">
        <span className="text-[12.5px] text-muted">
          {new Date(entry.calculatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}
        </span>
        <span className="money text-[17px] font-bold text-ink">{formatCurrencyBRL(entry.billAmount)}</span>
      </div>

      <div className="order-last w-full min-w-0 sm:order-none sm:w-auto sm:flex-1">
        <div className="flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden>
          {PEOPLE.map(({ key, field }) => (
            <div
              key={key}
              className={PERSON_COLORS[key].dot}
              style={{ width: `${(entry[field] / total) * 100}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {PEOPLE.map(({ key, field }) => (
            <span key={key} className="flex items-center gap-1.5 text-[13px] text-muted">
              <span className={cn("h-2 w-2 rounded-full", PERSON_COLORS[key].dot)} />
              {PERSON_LABELS[key]}
              <span className="money font-semibold text-ink">{formatCurrencyBRL(entry[field])}</span>
            </span>
          ))}
        </div>
      </div>

      <RowActions
        disabled={isPending}
        actions={[
          { icon: Pencil, label: "Editar divisão", onClick: () => setIsEditing(true) },
          { icon: X, label: "Remover divisão", onClick: handleRemove },
        ]}
      />
    </div>
  );
}
