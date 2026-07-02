import * as fixedBillRepository from "@/repositories/fixed-bill.repository";
import type { CreateFixedBillInput } from "@/schemas/fixed-bill.schema";
import type { FixedBill, FixedBillPayer, FixedBillStatus } from "@/types/fixed-bill";
import type { PaginatedResult } from "@/types/pagination";

export const FIXED_BILLS_PAGE_SIZE = 10;

export const PAYER_LABELS: Record<FixedBillPayer, string> = {
  salary1: "Salário 1",
  salary2: "Salário 2",
  salary3: "Salário 3",
  split: "Dividir",
};

export interface FixedBillView extends FixedBill {
  status: FixedBillStatus;
  showAlert: boolean;
  alertText: string;
  payerLabel: string;
}

export function getFixedBillStatus(dueDay: number, todayOfMonth: number): FixedBillStatus {
  const diff = dueDay - todayOfMonth;
  if (diff < 0) return "overdue";
  if (diff <= 5) return "upcoming";
  return "ok";
}

export function decorateFixedBills(bills: FixedBill[], today: Date = new Date()): FixedBillView[] {
  const todayOfMonth = today.getDate();

  return bills.map((bill) => {
    const diff = bill.dueDay - todayOfMonth;
    const status = getFixedBillStatus(bill.dueDay, todayOfMonth);
    const showAlert = !bill.isPaid && status !== "ok";

    let alertText = "";
    if (status === "overdue") {
      alertText = `${bill.name} está atrasada (venceu dia ${bill.dueDay})`;
    } else if (status === "upcoming") {
      alertText = `${bill.name} vence ${
        diff === 0 ? "hoje" : `em ${diff} dia${diff > 1 ? "s" : ""}`
      } (dia ${bill.dueDay})`;
    }

    return { ...bill, status, showAlert, alertText, payerLabel: PAYER_LABELS[bill.payer] };
  });
}

/**
 * Todas as contas fixas, sem paginação — usado para totais/alertas e para
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

export async function toggleFixedBillPaid(id: string, isPaid: boolean): Promise<FixedBill> {
  return fixedBillRepository.toggleFixedBillPaid(id, isPaid);
}

export async function deleteFixedBill(id: string): Promise<void> {
  return fixedBillRepository.deleteFixedBill(id);
}
