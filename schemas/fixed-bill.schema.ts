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
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mês inválido"),
  name: z.string().trim().min(1, "Informe o nome da conta"),
  amount: z.number().positive("Informe um valor válido"),
  category: z.enum(fixedBillCategories),
  payer: z.enum(fixedBillPayers),
});

export type CreateFixedBillInput = z.infer<typeof createFixedBillSchema>;

/**
 * Schema usado pelo React Hook Form no cliente: amount fica como texto livre
 * enquanto o usuário digita. A conversão para número acontece no submit, e a
 * validação definitiva é sempre refeita no servidor via `createFixedBillSchema`.
 */
export const createFixedBillFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da conta"),
  amount: z.string().min(1, "Informe o valor da conta"),
  category: z.enum(fixedBillCategories),
  payer: z.enum(fixedBillPayers),
});

export type CreateFixedBillFormValues = z.infer<typeof createFixedBillFormSchema>;

export const updateFixedBillSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da conta"),
  amount: z.number().positive("Informe um valor válido"),
  category: z.enum(fixedBillCategories),
});

export type UpdateFixedBillInput = z.infer<typeof updateFixedBillSchema>;

export const updateFixedBillFormSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da conta"),
  amount: z.string().min(1, "Informe o valor da conta"),
  category: z.enum(fixedBillCategories),
});

export type UpdateFixedBillFormValues = z.infer<typeof updateFixedBillFormSchema>;
