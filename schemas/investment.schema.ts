import { z } from "zod";

export const assetClasses = ["acao", "fii", "renda_fixa", "internacional", "cripto"] as const;

export const investorProfiles = ["conservador", "moderado", "arrojado"] as const;

export const simulationRateModes = ["cdi", "fixed"] as const;

export const createAssetSchema = z.object({
  ticker: z.string().trim().min(1, "Informe o ticker").max(16, "Ticker muito longo").toUpperCase(),
  name: z.string().trim().min(1, "Informe o nome do ativo"),
  assetClass: z.enum(assetClasses),
  quantity: z.number().positive("Informe uma quantidade válida"),
  avgPrice: z.number().min(0),
  currentPrice: z.number().min(0),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;

export const updateAssetSchema = createAssetSchema.extend({
  id: z.string().min(1),
});

export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;

export const deleteAssetSchema = z.object({
  id: z.string().min(1),
});

export type DeleteAssetInput = z.infer<typeof deleteAssetSchema>;

export const updateInvestmentSettingsSchema = z.object({
  investorProfile: z.enum(investorProfiles),
  reserveMonthlyCost: z.number().min(0),
  reserveTargetMonths: z.number().int().min(1, "Mínimo de 1 mês").max(60, "Máximo de 60 meses"),
});

export type UpdateInvestmentSettingsInput = z.infer<typeof updateInvestmentSettingsSchema>;

export const createIncomeSchema = z.object({
  receivedAt: z.string().min(1, "Informe a data"),
  source: z.string().trim().min(1, "Informe a fonte"),
  amount: z.number().positive("Informe um valor válido"),
});

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;

export const deleteIncomeSchema = z.object({
  id: z.string().min(1),
});

export type DeleteIncomeInput = z.infer<typeof deleteIncomeSchema>;

/**
 * Schemas de formulário (cliente): valores monetários são strings de centavos
 * (convenção do `CurrencyInput`) e a quantidade fica como texto livre enquanto
 * o usuário digita. A conversão para número acontece no submit e a validação
 * definitiva é sempre refeita no servidor via `createAssetSchema`.
 */
export const assetFormSchema = z.object({
  id: z.string().optional(),
  ticker: z.string().trim().min(1, "Informe o ticker"),
  name: z.string().trim().min(1, "Informe o nome do ativo"),
  assetClass: z.enum(assetClasses),
  quantity: z.string().min(1, "Informe a quantidade"),
  avgPrice: z.string().min(1, "Informe o preço médio"),
  currentPrice: z.string().min(1, "Informe o preço atual"),
});

export type AssetFormValues = z.infer<typeof assetFormSchema>;

export const incomeFormSchema = z.object({
  receivedAt: z.string().min(1, "Informe a data"),
  source: z.string().trim().min(1, "Informe a fonte"),
  amount: z.string().min(1, "Informe o valor"),
});

export type IncomeFormValues = z.infer<typeof incomeFormSchema>;
