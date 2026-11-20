import { z } from "zod";

import { monthKeySchema, splitModes } from "./month.schema";

/**
 * Registro da divisão do mês no histórico. `inss + extraPai` formam o
 * "salário 1" (paga primeiro); `salary2`/`salary3` só pesam no modo
 * proporcional. `billAmount` é o total do mês (contas somadas + cartão).
 */
export const calculateSchema = z.object({
  month: monthKeySchema,
  inss: z.number().min(0),
  extraPai: z.number().min(0),
  salary2: z.number().min(0),
  salary3: z.number().min(0),
  splitMode: z.enum(splitModes),
  billAmount: z.number().positive("Não há despesas neste mês para dividir"),
});

export type CalculateInput = z.infer<typeof calculateSchema>;

/**
 * Schema usado pelo React Hook Form no cliente: os campos de moeda ficam
 * como texto livre (centavos mascarados) enquanto o usuário digita. A
 * conversão para número acontece no submit, e a validação definitiva é
 * sempre refeita via `calculateSchema`.
 */
export const calculateFormSchema = z.object({
  inss: z.string(),
  extraPai: z.string(),
  salary2: z.string(),
  salary3: z.string(),
  splitMode: z.enum(splitModes),
});

export type CalculateFormValues = z.infer<typeof calculateFormSchema>;
