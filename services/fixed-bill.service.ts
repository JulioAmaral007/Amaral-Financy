import * as fixedBillRepository from "@/repositories/fixed-bill.repository";
import type { CreateFixedBillInput } from "@/schemas/fixed-bill.schema";
import type { FixedBill, FixedBillPayer } from "@/types/fixed-bill";
import type { PaginatedResult } from "@/types/pagination";

export const FIXED_BILLS_PAGE_SIZE = 10;

export const PAYER_LABELS: Record<FixedBillPayer, string> = {
  salary1: "Salário 1",
  salary2: "Salário 2",
  salary3: "Salário 3",
  split: "Dividir",
};

export interface FixedBillView extends FixedBill {
  payerLabel: string;
}

export function decorateFixedBills(bills: FixedBill[]): FixedBillView[] {
  return bills.map((bill) => ({ ...bill, payerLabel: PAYER_LABELS[bill.payer] }));
}

/**
 * Soma das contas fixas marcadas para entrar no valor da conta da
 * calculadora — usada para preencher/atualizar o campo "Valor da conta".
 */
export function sumIncludedFixedBills(bills: FixedBill[]): number {
  return bills.filter((bill) => bill.includedInBill).reduce((sum, bill) => sum + bill.amount, 0);
}

/**
 * Todas as contas fixas, sem paginação — usado para totais e para
 * a agregação por mês do Histórico, que precisam do conjunto completo.
 */
export async function getAllFixedBills(): Promise<FixedBill[]> {
  return fixedBillRepository.listAllFixedBills();
}

export async function getFixedBillsPage(
  page: number,
  pageSize: number = FIXED_BILLS_PAGE_SIZE
): Promise<PaginatedResult<FixedBillView>> {
  const safePage = Math.max(1, page);
  const { bills, total } = await fixedBillRepository.listFixedBillsPage({
    limit: pageSize,
    offset: (safePage - 1) * pageSize,
  });

  return {
    items: decorateFixedBills(bills),
    page: safePage,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function createFixedBill(input: CreateFixedBillInput): Promise<FixedBill> {
  return fixedBillRepository.createFixedBill(input);
}

export async function toggleFixedBillIncluded(id: string, includedInBill: boolean): Promise<FixedBill> {
  return fixedBillRepository.toggleFixedBillIncluded(id, includedInBill);
}

export async function deleteFixedBill(id: string): Promise<void> {
  return fixedBillRepository.deleteFixedBill(id);
}
