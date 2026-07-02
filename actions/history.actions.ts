import * as historyService from "@/services/history.service";

export async function deleteHistoryEntryAction(id: string): Promise<void> {
  await historyService.deleteHistoryEntry(id);
}
