import { z } from "zod";

export const spendingCategories = ["Carne", "Gasolina", "Mercado", "Outros"] as const;

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe a data");

export const spendingSchema = z.object({
  category: z.enum(spendingCategories),
  date: dateField,
  amount: z.number().positive("Informe um valor válido"),
  note: z.string().trim().max(80, "Use até 80 caracteres"),
});

export type SpendingInput = z.infer<typeof spendingSchema>;

export const MAX_INSTALLMENTS = 48;

/** Novo lançamento: `amount` é o total da compra, dividido em `installments` parcelas mensais. */
export const newSpendingSchema = spendingSchema.extend({
  installments: z
    .number()
    .int("Informe o número de parcelas")
    .min(1, "Informe o número de parcelas")
    .max(MAX_INSTALLMENTS, `Use até ${MAX_INSTALLMENTS} parcelas`),
});

export type NewSpendingInput = z.infer<typeof newSpendingSchema>;

/**
 * Schema usado pelo React Hook Form no cliente: amount fica como texto livre
 * (centavos mascarados) enquanto o usuário digita. A conversão para número
 * acontece no submit, e a validação definitiva é refeita via `spendingSchema`.
 */
export const spendingFormSchema = z.object({
  category: z.enum(spendingCategories),
  date: dateField,
  amount: z.string().min(1, "Informe o valor"),
  note: z.string().trim().max(80, "Use até 80 caracteres"),
  installments: z.number().int().min(1).max(MAX_INSTALLMENTS),
});

export type SpendingFormValues = z.infer<typeof spendingFormSchema>;
