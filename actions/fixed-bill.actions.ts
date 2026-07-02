import { createFixedBillSchema, type CreateFixedBillInput } from "@/schemas/fixed-bill.schema";
import * as fixedBillService from "@/services/fixed-bill.service";

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

export async function toggleFixedBillPaidAction(id: string, isPaid: boolean): Promise<void> {
  await fixedBillService.toggleFixedBillPaid(id, isPaid);
}

export async function deleteFixedBillAction(id: string): Promise<void> {
  await fixedBillService.deleteFixedBill(id);
}
