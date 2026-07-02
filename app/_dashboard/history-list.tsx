import type { HistoryEntry } from "@/types/history";

import { HistoryEntryRow } from "./history-entry-row";

interface HistoryListProps {
  entries: HistoryEntry[];
  onChanged: () => void;
}

export function HistoryList({ entries, onChanged }: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-foreground/45">Nenhum cálculo registrado ainda.</p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry) => (
        <HistoryEntryRow key={entry.id} entry={entry} onChanged={onChanged} />
      ))}
    </div>
  );
}
