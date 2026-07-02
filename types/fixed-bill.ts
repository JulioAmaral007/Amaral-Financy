export type FixedBillCategory =
  | "Moradia"
  | "Utilidades"
  | "Assinaturas"
  | "Transporte"
  | "Saúde"
  | "Outros";

export type FixedBillPayer = "salary1" | "salary2" | "salary3" | "split";

export type FixedBillStatus = "overdue" | "upcoming" | "ok";

export interface FixedBill {
  id: string;
  name: string;
  amount: number;
  category: FixedBillCategory;
  payer: FixedBillPayer;
  dueDay: number;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}
