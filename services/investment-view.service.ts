import { monthShortLabel, monthYearLabel, parseISODateLocal } from "@/lib/date";
import { formatCurrencyBRL, formatPercent, round2 } from "@/lib/utils";
import {
  ALLOCATION_DRIFT_THRESHOLD,
  ASSET_CLASS_META,
  ASSET_CLASS_ORDER,
  INVESTOR_PROFILE_META,
  annualRateOverMonths,
  assetReturnPct,
  assetValue,
  compoundReturns,
  computeMonthlyReturns,
  computePortfolioTotals,
  sumValueByClass,
} from "@/services/investment-math.service";
import type {
  AssetClass,
  InvestmentAsset,
  InvestmentIncome,
  InvestmentSettings,
  InvestmentSnapshot,
} from "@/types/investment";

const CONTRIBUTION_BARS = 8;
const RESERVE_ASSET_CLASS: AssetClass = "renda_fixa";

export interface AssetView {
  id: string;
  ticker: string;
  name: string;
  assetClass: AssetClass;
  classLabel: string;
  classShort: string;
  classColor: string;
  quantity: number;
  quantityLabel: string;
  avgPrice: number;
  avgPriceFormatted: string;
  currentPrice: number;
  currentPriceFormatted: string;
  value: number;
  valueFormatted: string;
  returnPct: number;
  returnLabel: string;
  returnPositive: boolean;
}

export interface AllocationRow {
  assetClass: AssetClass;
  label: string;
  color: string;
  valueFormatted: string;
  pct: number;
  pctLabel: string;
  targetPct: number;
  targetLabel: string;
  driftLabel: string | null;
}

export interface BenchmarkRow {
  key: string;
  label: string;
  valueLabel: string;
  barWidthPct: number;
  color: string;
}

export interface ProfileTargetRow {
  assetClass: AssetClass;
  label: string;
  color: string;
  pctLabel: string;
}

export interface ReserveView {
  currentFormatted: string;
  targetFormatted: string;
  pct: number;
  pctLabel: string;
  coverageLabel: string;
}

export interface ContributionBar {
  month: string;
  monthLabel: string;
  barPct: number;
}

export interface IncomeRow {
  id: string;
  monthLabel: string;
  source: string;
  amountFormatted: string;
}

export interface PortfolioView {
  totalValueFormatted: string;
  gainFormatted: string;
  gainPctLabel: string;
  gainPositive: boolean;
  monthReturnLabel: string;
  yearReturnLabel: string;
  patrimonyPath: number[];
  patrimonyStartLabel: string;
  patrimonyEndLabel: string;
}

export interface InvestmentsViewData {
  portfolio: PortfolioView;
  assets: AssetView[];
  allocation: AllocationRow[];
  benchmarks: BenchmarkRow[];
  benchmarkMonthLabel: string;
  reserve: ReserveView;
  settings: InvestmentSettings;
  profileDescription: string;
  profileTargets: ProfileTargetRow[];
  contributions: ContributionBar[];
  contributionsTotalFormatted: string;
  contributionsAverageFormatted: string;
  incomes: IncomeRow[];
  incomesTotalFormatted: string;
  yieldOnCostLabel: string;
  cdiBaseRate: number;
  totalValue: number;
}

function formatSignedPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${formatPercent(value)}`;
}

function formatQuantity(quantity: number): string {
  return quantity.toLocaleString("pt-BR", { maximumFractionDigits: 6 });
}

function decorateAsset(asset: InvestmentAsset): AssetView {
  const meta = ASSET_CLASS_META[asset.assetClass];
  const returnPct = assetReturnPct(asset);

  return {
    id: asset.id,
    ticker: asset.ticker,
    name: asset.name,
    assetClass: asset.assetClass,
    classLabel: meta.label,
    classShort: meta.short,
    classColor: meta.color,
    quantity: asset.quantity,
    quantityLabel: formatQuantity(asset.quantity),
    avgPrice: asset.avgPrice,
    avgPriceFormatted: formatCurrencyBRL(asset.avgPrice),
    currentPrice: asset.currentPrice,
    currentPriceFormatted: formatCurrencyBRL(asset.currentPrice),
    value: assetValue(asset),
    valueFormatted: formatCurrencyBRL(assetValue(asset)),
    returnPct,
    returnLabel: formatSignedPercent(returnPct),
    returnPositive: returnPct >= 0,
  };
}

function buildAllocation(
  assets: InvestmentAsset[],
  totalValue: number,
  settings: InvestmentSettings
): AllocationRow[] {
  const targets = INVESTOR_PROFILE_META[settings.investorProfile].targets;

  return ASSET_CLASS_ORDER.map((assetClass) => {
    const value = sumValueByClass(assets, assetClass);
    const pct = totalValue > 0 ? (value / totalValue) * 100 : 0;
    const targetPct = targets[assetClass];
    const drift = pct - targetPct;

    return {
      assetClass,
      label: ASSET_CLASS_META[assetClass].label,
      color: ASSET_CLASS_META[assetClass].color,
      valueFormatted: formatCurrencyBRL(value),
      pct,
      pctLabel: formatPercent(pct),
      targetPct,
      targetLabel: `${targetPct}%`,
      driftLabel:
        totalValue > 0 && Math.abs(drift) >= ALLOCATION_DRIFT_THRESHOLD
          ? drift > 0
            ? "acima"
            : "abaixo"
          : null,
    };
  });
}

function buildBenchmarks(carteiraYtd: number, cdiYtd: number, ipcaYtd: number): BenchmarkRow[] {
  const rows = [
    { key: "carteira", label: "Carteira", pct: carteiraYtd, color: "var(--ink)" },
    { key: "cdi", label: "CDI", pct: cdiYtd, color: "var(--blue)" },
    { key: "ipca", label: "IPCA", pct: ipcaYtd, color: "var(--red)" },
  ];

  const largest = Math.max(...rows.map((row) => Math.abs(row.pct)), 0.01);

  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    valueLabel: formatSignedPercent(row.pct),
    barWidthPct: Math.max(2, (Math.abs(row.pct) / largest) * 100),
    color: row.color,
  }));
}

function buildReserve(assets: InvestmentAsset[], settings: InvestmentSettings): ReserveView {
  const current = sumValueByClass(assets, RESERVE_ASSET_CLASS);
  const target = round2(settings.reserveMonthlyCost * settings.reserveTargetMonths);
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const monthsCovered = settings.reserveMonthlyCost > 0 ? current / settings.reserveMonthlyCost : 0;

  return {
    currentFormatted: formatCurrencyBRL(current),
    targetFormatted: formatCurrencyBRL(target),
    pct,
    pctLabel: formatPercent(pct),
    coverageLabel:
      settings.reserveMonthlyCost > 0
        ? `${monthsCovered.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} meses cobertos`
        : "Informe o custo mensal",
  };
}

/** Aporte do mês = variação da base de custo. No primeiro mês, é a base inteira. */
function buildContributionSeries(snapshots: InvestmentSnapshot[]): { month: string; amount: number }[] {
  return snapshots.map((snapshot, index) => ({
    month: snapshot.month,
    amount: index === 0 ? snapshot.totalCost : round2(snapshot.totalCost - snapshots[index - 1].totalCost),
  }));
}

function buildContributionBars(series: { month: string; amount: number }[]): ContributionBar[] {
  const recent = series.slice(-CONTRIBUTION_BARS);
  const largest = Math.max(...recent.map((entry) => entry.amount), 0.01);

  return recent.map((entry) => ({
    month: entry.month,
    monthLabel: monthShortLabel(entry.month),
    barPct: entry.amount > 0 ? Math.max(6, (entry.amount / largest) * 100) : 2,
  }));
}

function buildPortfolioView(
  totalValue: number,
  totalGain: number,
  totalGainPct: number,
  snapshots: InvestmentSnapshot[],
  monthReturn: number | null,
  yearReturn: number | null,
  today: Date
): PortfolioView {
  const currentYearSnapshots = snapshots.filter(
    (snapshot) => parseISODateLocal(snapshot.month).getFullYear() === today.getFullYear()
  );

  return {
    totalValueFormatted: formatCurrencyBRL(totalValue),
    gainFormatted: `${totalGain > 0 ? "+" : ""}${formatCurrencyBRL(totalGain)}`,
    gainPctLabel: formatSignedPercent(totalGainPct),
    gainPositive: totalGain >= 0,
    monthReturnLabel: monthReturn === null ? "—" : formatSignedPercent(monthReturn),
    yearReturnLabel: yearReturn === null ? "—" : formatSignedPercent(yearReturn),
    patrimonyPath: currentYearSnapshots.map((snapshot) => snapshot.totalValue),
    patrimonyStartLabel: currentYearSnapshots.length > 0 ? monthYearLabel(currentYearSnapshots[0].month) : "",
    patrimonyEndLabel: formatCurrencyBRL(totalValue),
  };
}

export interface BuildInvestmentsViewInput {
  assets: InvestmentAsset[];
  snapshots: InvestmentSnapshot[];
  incomes: InvestmentIncome[];
  settings: InvestmentSettings;
  cdiBaseRate: number;
  today?: Date;
}

export function buildInvestmentsView({
  assets,
  snapshots,
  incomes,
  settings,
  cdiBaseRate,
  today = new Date(),
}: BuildInvestmentsViewInput): InvestmentsViewData {
  const { totalValue, totalCost, totalGain, totalGainPct } = computePortfolioTotals(assets);

  const monthlyReturns = computeMonthlyReturns(snapshots);
  const currentYearReturns = monthlyReturns.filter(
    (entry) => parseISODateLocal(entry.month).getFullYear() === today.getFullYear()
  );

  const monthReturn = monthlyReturns.length > 0 ? monthlyReturns[monthlyReturns.length - 1].returnPct : null;
  const yearReturn = currentYearReturns.length > 0 ? compoundReturns(currentYearReturns.map((r) => r.returnPct)) : null;

  const monthsElapsedThisYear = today.getMonth() + 1;
  const cdiYtd = annualRateOverMonths(cdiBaseRate, monthsElapsedThisYear);
  const ipcaYtd = annualRateOverMonths(settings.ipcaAnnualRate, monthsElapsedThisYear);

  const contributionSeries = buildContributionSeries(snapshots);
  const contributionsTotal = round2(contributionSeries.reduce((sum, entry) => sum + Math.max(0, entry.amount), 0));
  const contributionsAverage = contributionSeries.length > 0 ? contributionsTotal / contributionSeries.length : 0;

  const incomesTotal = round2(incomes.reduce((sum, income) => sum + income.amount, 0));
  const yieldOnCost = totalCost > 0 ? (incomesTotal / totalCost) * 100 : 0;

  const profileMeta = INVESTOR_PROFILE_META[settings.investorProfile];

  return {
    portfolio: buildPortfolioView(totalValue, totalGain, totalGainPct, snapshots, monthReturn, yearReturn, today),
    assets: assets.map(decorateAsset),
    allocation: buildAllocation(assets, totalValue, settings),
    benchmarks: buildBenchmarks(yearReturn ?? 0, cdiYtd, ipcaYtd),
    benchmarkMonthLabel: [
      `carteira ${monthReturn === null ? "—" : formatSignedPercent(monthReturn)}`,
      `CDI ${formatSignedPercent(annualRateOverMonths(cdiBaseRate, 1))}`,
      `IPCA ${formatSignedPercent(annualRateOverMonths(settings.ipcaAnnualRate, 1))}`,
    ].join(" · "),
    reserve: buildReserve(assets, settings),
    settings,
    profileDescription: profileMeta.description,
    profileTargets: ASSET_CLASS_ORDER.map((assetClass) => ({
      assetClass,
      label: ASSET_CLASS_META[assetClass].label,
      color: ASSET_CLASS_META[assetClass].color,
      pctLabel: `${profileMeta.targets[assetClass]}%`,
    })),
    contributions: buildContributionBars(contributionSeries),
    contributionsTotalFormatted: formatCurrencyBRL(contributionsTotal),
    contributionsAverageFormatted: formatCurrencyBRL(round2(contributionsAverage)),
    incomes: incomes.map((income) => ({
      id: income.id,
      monthLabel: monthShortLabel(income.receivedAt),
      source: income.source,
      amountFormatted: formatCurrencyBRL(income.amount),
    })),
    incomesTotalFormatted: formatCurrencyBRL(incomesTotal),
    yieldOnCostLabel: formatPercent(yieldOnCost),
    cdiBaseRate,
    totalValue,
  };
}
