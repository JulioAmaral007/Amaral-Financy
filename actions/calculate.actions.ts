import { calculateSchema, type CalculateInput } from "@/schemas/calculate.schema";
import * as billSplitService from "@/services/bill-split.service";
import * as historyService from "@/services/history.service";
import * as profileService from "@/services/profile.service";
import type { SalarySplitResult } from "@/types/bill-split";

export interface CalculateActionState {
  error?: string;
  result?: SalarySplitResult;
}

export async function calculateAction(input: CalculateInput): Promise<CalculateActionState> {
  const parsed = calculateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { salary1, salary2, salary3, billAmount } = parsed.data;
  const result = billSplitService.calculateSalarySplit(salary1, salary2, salary3, billAmount);

  try {
    await profileService.updateSalaries({ salary1, salary2, salary3 });
    await historyService.recordCalculation(result, billAmount);
  } catch {
    return { error: "Erro ao salvar o cálculo. Tente novamente.", result };
  }

  return { result };
}
