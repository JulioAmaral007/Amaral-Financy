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
});

export type SpendingFormValues = z.infer<typeof spendingFormSchema>;
