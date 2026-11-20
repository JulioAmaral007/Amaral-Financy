export type FixedBillCategory =
  | "Moradia"
  | "Utilidades"
  | "Assinaturas"
  | "Transporte"
  | "Saúde"
  | "Outros";

export type FixedBillPayer = "salary1" | "salary2" | "salary3" | "split";

export interface FixedBill {
  id: string;
  name: string;
  amount: number;
  category: FixedBillCategory;
  payer: FixedBillPayer;
  includedInBill: boolean;
  /** Mês ao qual a conta pertence, no formato "YYYY-MM". */
  month: string;
  createdAt: string;
  updatedAt: string;
}
