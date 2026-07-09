export type AssetClass = "acao" | "fii" | "renda_fixa" | "internacional" | "cripto";

export type InvestorProfile = "conservador" | "moderado" | "arrojado";

export type SimulationRateMode = "cdi" | "fixed";

export interface InvestmentAsset {
  id: string;
  ticker: string;
  name: string;
  assetClass: AssetClass;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentSettings {
  investorProfile: InvestorProfile;
  reserveMonthlyCost: number;
  reserveTargetMonths: number;
  ipcaAnnualRate: number;
}

/**
 * Fotografia mensal da carteira, gravada automaticamente a cada mutação de
 * ativo. `totalCost` é a base de custo (quantidade × preço médio); a variação
 * dela entre dois meses é o aporte do período, e o que sobra na variação de
 * `totalValue` é rentabilidade.
 */
export interface InvestmentSnapshot {
  month: string;
  totalValue: number;
  totalCost: number;
}

export interface InvestmentIncome {
  id: string;
  receivedAt: string;
  source: string;
  amount: number;
  createdAt: string;
}
