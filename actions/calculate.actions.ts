import { calculateSchema, type CalculateInput } from "@/schemas/calculate.schema";
import * as billSplitService from "@/services/bill-split.service";
import * as historyService from "@/services/history.service";
import type { SalarySplitResult } from "@/types/bill-split";

export interface CalculateActionState {
  error?: string;
  result?: SalarySplitResult;
}

/** Registra no histórico a divisão do mês com as entradas e o total informados. */
export async function calculateAction(input: CalculateInput): Promise<CalculateActionState> {
  const parsed = calculateSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { month, inss, extraPai, salary2, salary3, splitMode, billAmount } = parsed.data;
  const result = billSplitService.calculateMonthSplit(
    splitMode,
    { salary1: inss + extraPai, salary2, salary3 },
    billAmount
  );

  try {
    await historyService.recordCalculation(month, result, billAmount);
  } catch {
    return { error: "Erro ao salvar o cálculo. Tente novamente.", result };
  }

  return { result };
}
