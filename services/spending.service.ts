import * as spendingRepository from "@/repositories/spending.repository";
import type { SpendingInput } from "@/schemas/spending.schema";
import type { Spending } from "@/types/month";

export async function getSpendingsForMonth(month: string): Promise<Spending[]> {
  return spendingRepository.listSpendingsForMonth(month);
}

export async function createSpending(input: SpendingInput): Promise<Spending> {
  return spendingRepository.createSpending(input);
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
