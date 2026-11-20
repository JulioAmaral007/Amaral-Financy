import { PERSON_LABELS } from "@/lib/people";
import * as fixedBillRepository from "@/repositories/fixed-bill.repository";
import type { CreateFixedBillInput, UpdateFixedBillInput } from "@/schemas/fixed-bill.schema";
import type { FixedBill, FixedBillPayer } from "@/types/fixed-bill";

export const PAYER_LABELS: Record<FixedBillPayer, string> = {
  salary1: PERSON_LABELS.salary1,
  salary2: PERSON_LABELS.salary2,
  salary3: PERSON_LABELS.salary3,
  split: "Dividir",
};

export interface FixedBillView extends FixedBill {
  payerLabel: string;
}

export function decorateFixedBills(bills: FixedBill[]): FixedBillView[] {
  return bills.map((bill) => ({ ...bill, payerLabel: PAYER_LABELS[bill.payer] }));
}

/**
 * Soma das contas marcadas para entrar na conta do mês (o "TOTAL" da
 * planilha, antes de somar o cartão de crédito).
 */
export function sumIncludedFixedBills(bills: FixedBill[]): number {
  return bills.filter((bill) => bill.includedInBill).reduce((sum, bill) => sum + bill.amount, 0);
}

/** Contas de um mês (todas cabem numa tela: ~15 linhas, como na planilha). */
export async function getFixedBillsForMonth(month: string): Promise<FixedBillView[]> {
  return decorateFixedBills(await fixedBillRepository.listFixedBillsForMonth(month));
}

/** Todas as contas de todos os meses — usado para os totais por mês do gráfico. */
export async function getAllFixedBills(): Promise<FixedBill[]> {
  return fixedBillRepository.listAllFixedBills();
}

/** Copia as contas de `fromMonth` para `toMonth`; devolve quantas foram copiadas. */
export async function copyFixedBills(fromMonth: string, toMonth: string): Promise<number> {
  return fixedBillRepository.copyFixedBills(fromMonth, toMonth);
}

export async function createFixedBill(input: CreateFixedBillInput): Promise<FixedBill> {
  return fixedBillRepository.createFixedBill(input);
}

export async function updateFixedBill(id: string, input: UpdateFixedBillInput): Promise<FixedBill> {
  return fixedBillRepository.updateFixedBill(id, input);
}

export async function toggleFixedBillIncluded(id: string, includedInBill: boolean): Promise<FixedBill> {
  return fixedBillRepository.toggleFixedBillIncluded(id, includedInBill);
}

export async function deleteFixedBill(id: string): Promise<void> {
  return fixedBillRepository.deleteFixedBill(id);
}

export async function restoreFixedBill(id: string): Promise<void> {
  return fixedBillRepository.restoreFixedBill(id);
}
