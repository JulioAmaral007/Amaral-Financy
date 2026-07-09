import { z } from "zod";

export const goalCategories = [
  "reserva",
  "casa",
  "carro",
  "viagem",
  "aposentadoria",
  "computador",
  "outro",
] as const;

export const goalPriorities = ["alta", "media", "baixa"] as const;

export const goalRateModes = ["cdi", "fixed"] as const;

export const createGoalSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome da meta"),
  description: z.string().trim().default(""),
  category: z.enum(goalCategories),
  targetValue: z.number().positive("Informe um valor alvo válido"),
  currentValue: z.number().min(0).default(0),
  initialContribution: z.number().min(0).default(0),
  monthlyContribution: z.number().min(0).default(0),
  startDate: z.string().min(1, "Informe a data de início"),
  rateMode: z.enum(goalRateModes),
  cdiPercent: z.number().min(0).default(100),
  fixedAnnualRate: z.number().min(0).default(12),
  priority: z.enum(goalPriorities),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;

export const updateGoalSchema = createGoalSchema.extend({
  id: z.string().min(1),
});

export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;

export const deleteGoalSchema = z.object({
  id: z.string().min(1),
});

export type DeleteGoalInput = z.infer<typeof deleteGoalSchema>;

/**
 * Schema usado pelo React Hook Form no cliente: valores monetários ficam
 * como string de centavos (convenção do CurrencyInput) e percentuais como
 * texto livre enquanto o usuário digita. A conversão para número acontece
 * no submit, e a validação definitiva é sempre refeita no servidor via
 * `createGoalSchema`/`updateGoalSchema`.
 */
export const goalFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Informe o nome da meta"),
  description: z.string(),
  category: z.enum(goalCategories),
  targetValue: z.string().min(1, "Informe o valor alvo"),
  currentValue: z.string(),
  initialContribution: z.string(),
  monthlyContribution: z.string(),
  startDate: z.string().min(1, "Informe a data de início"),
  rateMode: z.enum(goalRateModes),
  cdiPercent: z.string(),
  fixedAnnualRate: z.string(),
  priority: z.enum(goalPriorities),
});

export type GoalFormValues = z.infer<typeof goalFormSchema>;
