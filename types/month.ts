/** Chave de mês no formato "YYYY-MM" (ex.: "2026-11"). */
export type MonthKey = string;

/** "equal" = saldo dividido 50/50; "proportional" = proporcional ao salário. */
export type SplitMode = "equal" | "proportional";

export type SpendingCategory = "Carne" | "Gasolina" | "Mercado" | "Outros";

/** Gasto avulso (cartão de crédito da casa), lançado com data. */
export interface Spending {
  id: string;
  category: SpendingCategory;
  /** Data do gasto no formato "YYYY-MM-DD". */
  date: string;
  amount: number;
  note: string;
  createdAt: string;
  updatedAt: string;
}

/** Entradas e estimativas de um mês (as células editáveis da planilha). */
export interface MonthSettings {
  month: MonthKey;
  inss: number;
  extraPai: number;
  splitMode: SplitMode;
  /** "Valor estimado" por categoria de gasto. */
  budgets: Record<SpendingCategory, number>;
}

export interface MonthTotals {
  /** Soma das contas do mês marcadas como "somadas". */
  bills: number;
  /** Soma dos gastos avulsos (cartão de crédito) do mês. */
  spending: number;
  /** bills + spending — o "TOTAL" da planilha. */
  total: number;
}
