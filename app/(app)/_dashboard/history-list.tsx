import { formatCurrencyBRL } from "@/lib/utils";
import type { HistoryEntry } from "@/types/history";

interface HistoryListProps {
  entries: HistoryEntry[];
}

export function HistoryList({ entries }: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-foreground/45">Nenhum cálculo registrado ainda.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="flex items-center gap-3.5 rounded-[10px] border border-border/6 bg-input px-4 py-3"
        >
          <span className="w-12 flex-none text-xs text-foreground/45">
            {new Date(entry.calculatedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
          </span>
          <span className="flex-1 font-mono text-[13.5px] font-semibold text-foreground">
            {formatCurrencyBRL(entry.billAmount)}
          </span>
          <div className="flex gap-3.5 font-mono text-[11.5px]">
            <span className="text-primary-soft">S1 {formatCurrencyBRL(entry.salary1Payment)}</span>
            <span className="text-blue-soft">S2 {formatCurrencyBRL(entry.salary2Payment)}</span>
            <span className="text-purple-soft">S3 {formatCurrencyBRL(entry.salary3Payment)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
