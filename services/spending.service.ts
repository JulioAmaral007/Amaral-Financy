import * as spendingRepository from "@/repositories/spending.repository";
import type { NewSpendingInput, SpendingInput } from "@/schemas/spending.schema";
import type { Spending } from "@/types/month";

export async function getSpendingsForMonth(month: string): Promise<Spending[]> {
  return spendingRepository.listSpendingsForMonth(month);
}

export async function createSpending(input: NewSpendingInput): Promise<Spending[]> {
  const { installments, ...spending } = input;
  if (installments > 1) return spendingRepository.createInstallmentSpendings({ ...spending, installments });
  return [await spendingRepository.createSpending(spending)];
}

export async function updateSpending(id: string, input: SpendingInput): Promise<Spending> {
  return spendingRepository.updateSpending(id, input);
}

export async function deleteSpending(id: string): Promise<void> {
  return spendingRepository.deleteSpending(id);
}

export async function restoreSpending(id: string): Promise<void> {
  return spendingRepository.restoreSpending(id);
}

/** Remove a parcela e as seguintes; devolve os ids para poder desfazer. */
export async function deleteInstallmentsFrom(groupId: string, fromNumber: number): Promise<string[]> {
  return spendingRepository.deleteInstallmentsFrom(groupId, fromNumber);
}

export async function restoreSpendings(ids: string[]): Promise<void> {
  return spendingRepository.restoreSpendings(ids);
}
