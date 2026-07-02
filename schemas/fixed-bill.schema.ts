import { z } from "zod";

export const fixedBillCategories = [
  "Moradia",
  "Utilidades",
  "Assinaturas",
  "Transporte",
  "Saúde",
  "Outros",
] as const;

export const fixedBillPayers = ["salary1", "salary2", "salary3", "split"] as const;

export const createFixedBillSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da conta"),
  amount: z.number().positive("Informe um valor válido"),
  category: z.enum(fixedBillCategories),
  payer: z.enum(fixedBillPayers),
  dueDay: z.number().int().min(1, "Dia inválido").max(28, "Dia inválido"),
});

export type CreateFixedBillInput = z.infer<typeof createFixedBillSchema>;

/**
 * Schema usado pelo React Hook Form no cliente: amount/dueDay ficam como
 * texto livre enquanto o usuário digita. A conversão para número acontece
 * no submit, e a validação definitiva é sempre refeita no servidor via
 * `createFixedBillSchema`.
 */
export const createFixedBillFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da conta"),
  amount: z.string().min(1, "Informe o valor da conta"),
  category: z.enum(fixedBillCategories),
  payer: z.enum(fixedBillPayers),
  dueDay: z.string().min(1, "Informe o dia de vencimento"),
});

export type CreateFixedBillFormValues = z.infer<typeof createFixedBillFormSchema>;
