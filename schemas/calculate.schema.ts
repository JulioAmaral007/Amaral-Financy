import { z } from "zod";

export const calculateSchema = z.object({
  salary1: z.number().min(0),
  salary2: z.number().min(0),
  salary3: z.number().min(0),
  billAmount: z.number().positive("Informe o valor da conta"),
});

export type CalculateInput = z.infer<typeof calculateSchema>;

/**
 * Schema usado pelo React Hook Form no cliente: os campos de moeda ficam
 * como texto livre (formato pt-BR, ex. "1.234,56") enquanto o usuário digita.
 * A conversão para número acontece no submit, e a validação de negócio
 * definitiva é sempre refeita no servidor via `calculateSchema`.
 */
export const calculateFormSchema = z.object({
  salary1: z.string(),
  salary2: z.string(),
  salary3: z.string(),
  billAmount: z.string().min(1, "Informe o valor da conta"),
});

export type CalculateFormValues = z.infer<typeof calculateFormSchema>;
