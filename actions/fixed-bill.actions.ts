import {
  createFixedBillSchema,
  updateFixedBillSchema,
  type CreateFixedBillInput,
  type UpdateFixedBillInput,
} from "@/schemas/fixed-bill.schema";
import * as fixedBillService from "@/services/fixed-bill.service";
import * as monthService from "@/services/month.service";

export interface FixedBillActionState {
  error?: string;
}

export async function createFixedBillAction(input: CreateFixedBillInput): Promise<FixedBillActionState> {
  const parsed = createFixedBillSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await fixedBillService.createFixedBill(parsed.data);
  } catch {
    return { error: "Erro ao salvar a conta. Tente novamente." };
  }

  return {};
}

export async function updateFixedBillAction(
  id: string,
  input: UpdateFixedBillInput
): Promise<FixedBillActionState> {
  const parsed = updateFixedBillSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await fixedBillService.updateFixedBill(id, parsed.data);
  } catch {
    return { error: "Erro ao atualizar a conta. Tente novamente." };
  }

  return {};
}

/** Copia as contas do mês anterior para `month`; devolve quantas foram copiadas. */
export async function copyPreviousMonthBillsAction(month: string): Promise<number> {
  return monthService.copyBillsFromPreviousMonth(month);
}

export async function toggleFixedBillIncludedAction(id: string, includedInBill: boolean): Promise<void> {
  await fixedBillService.toggleFixedBillIncluded(id, includedInBill);
}

export async function deleteFixedBillAction(id: string): Promise<void> {
  await fixedBillService.deleteFixedBill(id);
}

export async function restoreFixedBillAction(id: string): Promise<void> {
  await fixedBillService.restoreFixedBill(id);
}
