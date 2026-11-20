import type { HistoryEntry } from "@/types/history";

import { HistoryEntryRow } from "./history-entry-row";

interface HistoryListProps {
  entries: HistoryEntry[];
}

export function HistoryList({ entries }: HistoryListProps) {
  if (entries.length === 0) {
    return (
      <p className="text-[13.5px] text-muted">
        Nada registrado ainda. Quando os valores estiverem certos, use “Registrar divisão”.
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {entries.map((entry) => (
        <HistoryEntryRow key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
