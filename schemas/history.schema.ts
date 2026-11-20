import { z } from "zod";

export const updateHistoryEntrySchema = z.object({
  billAmount: z.number().positive("Informe o valor da conta"),
  salary1Payment: z.number().min(0),
  salary2Payment: z.number().min(0),
  salary3Payment: z.number().min(0),
});

export type UpdateHistoryEntryInput = z.infer<typeof updateHistoryEntrySchema>;

/**
 * Schema usado pelo React Hook Form no cliente: os campos de moeda ficam
 * como texto livre enquanto o usuário digita. A conversão para número
 * acontece no submit, e a validação definitiva é sempre refeita no servidor
 * via `updateHistoryEntrySchema`.
 */
export const updateHistoryEntryFormSchema = z.object({
  billAmount: z.string().min(1, "Informe o valor da conta"),
  salary1Payment: z.string(),
  salary2Payment: z.string(),
  salary3Payment: z.string(),
});

export type UpdateHistoryEntryFormValues = z.infer<typeof updateHistoryEntryFormSchema>;
