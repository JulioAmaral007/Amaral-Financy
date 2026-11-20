import { newSpendingSchema, spendingSchema, type NewSpendingInput, type SpendingInput } from "@/schemas/spending.schema";
import * as spendingService from "@/services/spending.service";

export interface SpendingActionState {
  error?: string;
}

export async function createSpendingAction(input: NewSpendingInput): Promise<SpendingActionState> {
  const parsed = newSpendingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await spendingService.createSpending(parsed.data);
  } catch {
    return { error: "Erro ao salvar o gasto. Tente novamente." };
  }

  return {};
}

export async function updateSpendingAction(id: string, input: SpendingInput): Promise<SpendingActionState> {
  const parsed = spendingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await spendingService.updateSpending(id, parsed.data);
  } catch {
    return { error: "Erro ao atualizar o gasto. Tente novamente." };
  }

  return {};
}

export async function deleteSpendingAction(id: string): Promise<void> {
  await spendingService.deleteSpending(id);
}

export async function restoreSpendingAction(id: string): Promise<void> {
  await spendingService.restoreSpending(id);
}

/** Remove a parcela e as seguintes da mesma compra; devolve os ids removidos. */
export async function deleteInstallmentsFromAction(groupId: string, fromNumber: number): Promise<string[]> {
  return spendingService.deleteInstallmentsFrom(groupId, fromNumber);
}

export async function restoreSpendingsAction(ids: string[]): Promise<void> {
  await spendingService.restoreSpendings(ids);
}
