import { round2 } from "@/lib/utils";
import type { AssetClass, InvestmentAsset, InvestmentSnapshot, InvestorProfile } from "@/types/investment";

// ── Metadados de domínio (client-safe: este arquivo é importado direto por
// componentes "use client", então nada de repositório/I-O aqui). ──

export const ASSET_CLASS_META: Record<AssetClass, { label: string; short: string; color: string }> = {
  acao: { label: "Ações", short: "AÇÃO", color: "var(--blue)" },
  fii: { label: "Fundos imobiliários", short: "FII", color: "var(--green)" },
  renda_fixa: { label: "Renda fixa", short: "RF", color: "var(--ink-soft)" },
  internacional: { label: "Internacional", short: "INTL", color: "var(--ink-faint)" },
  cripto: { label: "Cripto", short: "CRIP", color: "var(--red)" },
};

export const ASSET_CLASS_ORDER: AssetClass[] = ["renda_fixa", "acao", "fii", "internacional", "cripto"];

export const INVESTOR_PROFILE_META: Record<
  InvestorProfile,
  { label: string; shortLabel: string; description: string; targets: Record<AssetClass, number> }
> = {
  conservador: {
    label: "Conservador",
    shortLabel: "Conserv.",
    description:
      "Prioriza previsibilidade e liquidez. A maior parte fica em renda fixa, com uma fatia pequena em ativos de risco.",
    targets: { renda_fixa: 70, acao: 10, fii: 10, internacional: 8, cripto: 2 },
  },
  moderado: {
    label: "Moderado",
    shortLabel: "Moderado",
    description:
      "Equilíbrio entre segurança e crescimento: renda fixa segura a base e a renda variável puxa o retorno de longo prazo.",
    targets: { renda_fixa: 45, acao: 20, fii: 15, internacional: 15, cripto: 5 },
  },
  arrojado: {
    label: "Arrojado",
    shortLabel: "Arrojado",
    description:
      "Aceita oscilação em troca de retorno maior no longo prazo. Renda variável e exposição internacional dominam a carteira.",
    targets: { renda_fixa: 20, acao: 30, fii: 15, internacional: 25, cripto: 10 },
  },
};

/** Desvio (em pontos percentuais) a partir do qual a alocação vira um carimbo de alerta. */
export const ALLOCATION_DRIFT_THRESHOLD = 5;

// ── Carteira ──

export function assetValue(asset: InvestmentAsset): number {
  return round2(asset.quantity * asset.currentPrice);
}

export function assetCost(asset: InvestmentAsset): number {
  return round2(asset.quantity * asset.avgPrice);
}

/** Rentabilidade do ativo em %, medida contra o preço médio pago. */
export function assetReturnPct(asset: InvestmentAsset): number {
  if (asset.avgPrice <= 0) return 0;
  return ((asset.currentPrice - asset.avgPrice) / asset.avgPrice) * 100;
}

export interface PortfolioTotals {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPct: number;
}

export function computePortfolioTotals(assets: InvestmentAsset[]): PortfolioTotals {
  const totalValue = round2(assets.reduce((sum, asset) => sum + assetValue(asset), 0));
  const totalCost = round2(assets.reduce((sum, asset) => sum + assetCost(asset), 0));
  const totalGain = round2(totalValue - totalCost);
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return { totalValue, totalCost, totalGain, totalGainPct };
}

export function sumValueByClass(assets: InvestmentAsset[], assetClass: AssetClass): number {
  return round2(
    assets.filter((asset) => asset.assetClass === assetClass).reduce((sum, asset) => sum + assetValue(asset), 0)
  );
}

// ── Rentabilidade a partir dos snapshots mensais ──
//
// Entre dois meses, o aporte é a variação da base de custo. O que sobra na
// variação do valor de mercado é rentabilidade — é isso que separa "a carteira
// cresceu porque rendeu" de "a carteira cresceu porque entrou dinheiro".

export interface MonthlyReturn {
  month: string;
  contribution: number;
  returnPct: number;
}

export function computeMonthlyReturns(snapshots: InvestmentSnapshot[]): MonthlyReturn[] {
  return snapshots.slice(1).map((snapshot, index) => {
    const previous = snapshots[index];
    const contribution = round2(snapshot.totalCost - previous.totalCost);
    const gain = snapshot.totalValue - previous.totalValue - contribution;
    const returnPct = previous.totalValue > 0 ? (gain / previous.totalValue) * 100 : 0;

    return { month: snapshot.month, contribution, returnPct };
  });
}

/** Compõe uma série de rentabilidades percentuais num acumulado percentual. */
export function compoundReturns(returnsPct: number[]): number {
  const factor = returnsPct.reduce((acc, pct) => acc * (1 + pct / 100), 1);
  return (factor - 1) * 100;
}

/** Converte uma taxa anual (%) no acumulado (%) de `months` meses. */
export function annualRateOverMonths(annualRatePct: number, months: number): number {
  return (Math.pow(1 + annualRatePct / 100, months / 12) - 1) * 100;
}

// ── Simulador de aportes (juros compostos) ──

const SIMULATION_CAP_MONTHS = 600;

export interface ContributionSimulation {
  path: number[];
  finalValue: number;
  totalContributed: number;
  totalInterest: number;
  monthlyRate: number;
}

export interface ContributionSimulationInput {
  initialValue: number;
  monthlyContribution: number;
  years: number;
  annualRatePct: number;
}

export function simulateContributions({
  initialValue,
  monthlyContribution,
  years,
  annualRatePct,
}: ContributionSimulationInput): ContributionSimulation {
  const months = Math.min(SIMULATION_CAP_MONTHS, Math.max(1, Math.round(years * 12)));
  const monthlyRate = Math.pow(1 + Math.max(0, annualRatePct / 100), 1 / 12) - 1;

  let balance = round2(initialValue);
  const path: number[] = [balance];

  for (let month = 1; month <= months; month++) {
    balance = round2(balance * (1 + monthlyRate) + monthlyContribution);
    path.push(balance);
  }

  const totalContributed = round2(initialValue + monthlyContribution * months);

  return {
    path,
    finalValue: balance,
    totalContributed,
    totalInterest: round2(balance - totalContributed),
    monthlyRate,
  };
}

/** Taxa anual efetiva (%) a partir do modo de rendimento escolhido. */
export function resolveAnnualRatePct(
  rateMode: "cdi" | "fixed",
  cdiPercent: number,
  fixedAnnualRate: number,
  cdiBaseRate: number
): number {
  return rateMode === "cdi" ? (cdiPercent / 100) * cdiBaseRate : fixedAnnualRate;
}

// ── Gráfico de área (SVG) ──

export const CHART_VIEW_WIDTH = 640;
export const CHART_VIEW_HEIGHT = 200;
export const CHART_Y_BASELINE = CHART_VIEW_HEIGHT - 30;

const CHART_X_START = 30;
const CHART_X_RANGE = CHART_VIEW_WIDTH - 60;
const CHART_Y_RANGE = CHART_VIEW_HEIGHT - 60;
const CHART_SAMPLE_COUNT = 10;

export interface ChartPoint {
  x: number;
  y: number;
}

/** Reamostra a série em até 10 pontos e projeta no viewBox do gráfico. */
export function buildChartPoints(values: number[]): ChartPoint[] {
  if (values.length === 0) return [];
  const series = values.length === 1 ? [values[0], values[0]] : values;

  const maxIndex = series.length - 1;
  const sampleCount = Math.min(CHART_SAMPLE_COUNT, series.length);
  const sampled = Array.from({ length: sampleCount }, (_, i) => {
    const index = sampleCount === 1 ? 0 : Math.round((i * maxIndex) / (sampleCount - 1));
    return series[index];
  });

  const maxValue = Math.max(...sampled) * 1.15 || 1;
  const xStep = sampled.length > 1 ? CHART_X_RANGE / (sampled.length - 1) : 0;

  return sampled.map((value, i) => ({
    x: CHART_X_START + i * xStep,
    y: CHART_Y_BASELINE - (value / maxValue) * CHART_Y_RANGE,
  }));
}
