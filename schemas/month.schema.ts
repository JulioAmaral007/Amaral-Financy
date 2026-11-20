import { z } from "zod";

export const splitModes = ["equal", "proportional"] as const;

export const monthKeySchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Mês inválido");

/** "Valor estimado" por categoria de gasto (uma chave por `SpendingCategory`). */
export const budgetsSchema = z.object({
  Carne: z.number().min(0),
  Gasolina: z.number().min(0),
  Mercado: z.number().min(0),
  Outros: z.number().min(0),
});

/** Entradas do mês editadas na tela de divisão (INSS, extra, modo e salários). */
export const saveMonthInputsSchema = z.object({
  month: monthKeySchema,
  inss: z.number().min(0),
  extraPai: z.number().min(0),
  salary2: z.number().min(0),
  salary3: z.number().min(0),
  splitMode: z.enum(splitModes),
});

export type SaveMonthInputsInput = z.infer<typeof saveMonthInputsSchema>;

export const saveBudgetsSchema = z.object({
  month: monthKeySchema,
  budgets: budgetsSchema,
});

export type SaveBudgetsInput = z.infer<typeof saveBudgetsSchema>;

/** Formulário de estimativas: valores em centavos como texto (CurrencyInput). */
export const budgetsFormSchema = z.object({
  Carne: z.string(),
  Gasolina: z.string(),
  Mercado: z.string(),
  Outros: z.string(),
});

export type BudgetsFormValues = z.infer<typeof budgetsFormSchema>;
