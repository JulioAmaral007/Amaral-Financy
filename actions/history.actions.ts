import { updateHistoryEntrySchema, type UpdateHistoryEntryInput } from "@/schemas/history.schema";
import * as historyService from "@/services/history.service";

export interface HistoryActionState {
  error?: string;
}

export async function updateHistoryEntryAction(
  id: string,
  input: UpdateHistoryEntryInput
): Promise<HistoryActionState> {
  const parsed = updateHistoryEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await historyService.updateHistoryEntry(id, parsed.data);
  } catch {
    return { error: "Erro ao atualizar o cálculo. Tente novamente." };
  }

  return {};
}

export async function deleteHistoryEntryAction(id: string): Promise<void> {
  await historyService.deleteHistoryEntry(id);
}

export async function restoreHistoryEntryAction(id: string): Promise<void> {
  await historyService.restoreHistoryEntry(id);
}
