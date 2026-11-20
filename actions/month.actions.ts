import {
  saveBudgetsSchema,
  saveMonthInputsSchema,
  type SaveBudgetsInput,
  type SaveMonthInputsInput,
} from "@/schemas/month.schema";
import * as monthService from "@/services/month.service";
import * as profileService from "@/services/profile.service";

export interface MonthActionState {
  error?: string;
}

/**
 * Guarda as entradas da divisão do mês: INSS, extra e modo ficam no mês; os
 * salários de Thais e Julio ficam no perfil (valem como padrão para os
 * próximos meses, assim como o INSS).
 */
export async function saveMonthInputsAction(input: SaveMonthInputsInput): Promise<MonthActionState> {
  const parsed = saveMonthInputsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const { month, inss, extraPai, salary2, salary3, splitMode } = parsed.data;

  try {
    await monthService.updateMonthSettings(month, { inss, extraPai, splitMode });
    await profileService.updateSalaries({ salary1: inss, salary2, salary3 });
  } catch {
    return { error: "Erro ao salvar os dados do mês. Tente novamente." };
  }

  return {};
}

export async function saveBudgetsAction(input: SaveBudgetsInput): Promise<MonthActionState> {
  const parsed = saveBudgetsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await monthService.updateMonthSettings(parsed.data.month, { budgets: parsed.data.budgets });
  } catch {
    return { error: "Erro ao salvar as estimativas. Tente novamente." };
  }

  return {};
}
