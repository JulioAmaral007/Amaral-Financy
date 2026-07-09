import { addMonths, startOfMonthISO, toISODateLocal } from "@/lib/date";
import * as assetRepository from "@/repositories/investment-asset.repository";
import * as incomeRepository from "@/repositories/investment-income.repository";
import * as settingsRepository from "@/repositories/investment-settings.repository";
import * as snapshotRepository from "@/repositories/investment-snapshot.repository";
import type {
  CreateAssetInput,
  CreateIncomeInput,
  UpdateInvestmentSettingsInput,
} from "@/schemas/investment.schema";
import * as accountService from "@/services/account.service";
import * as authService from "@/services/auth.service";
import { computePortfolioTotals } from "@/services/investment-math.service";
import { buildInvestmentsView, type InvestmentsViewData } from "@/services/investment-view.service";
import type { InvestmentSettings } from "@/types/investment";

const DEFAULT_CDI_BASE_RATE = 10.65;
const INCOME_WINDOW_MONTHS = 12;
const INCOME_LIST_LIMIT = 24;

const DEFAULT_SETTINGS: InvestmentSettings = {
  investorProfile: "moderado",
  reserveMonthlyCost: 0,
  reserveTargetMonths: 6,
  ipcaAnnualRate: 4.5,
};

async function requireUserId(): Promise<string> {
  const user = await authService.getCurrentUser();
  if (!user) throw new Error("not authenticated");
  return user.id;
}

/**
 * Regrava a fotografia do mês corrente. Chamado depois de toda mutação de ativo
 * — é essa série que separa aporte de rentabilidade nos gráficos.
 */
async function syncCurrentMonthSnapshot(userId: string): Promise<void> {
  const assets = await assetRepository.listAssets(userId);
  const { totalValue, totalCost } = computePortfolioTotals(assets);
  await snapshotRepository.upsertSnapshot(userId, startOfMonthISO(new Date()), totalValue, totalCost);
}

export async function getInvestmentsView(): Promise<InvestmentsViewData | null> {
  const user = await authService.getCurrentUser();
  if (!user) return null;

  const incomesSince = toISODateLocal(addMonths(new Date(), -INCOME_WINDOW_MONTHS));

  const [assets, snapshots, incomes, settings, account] = await Promise.all([
    assetRepository.listAssets(user.id),
    snapshotRepository.listSnapshots(user.id),
    incomeRepository.listIncomes(user.id, incomesSince, INCOME_LIST_LIMIT),
    settingsRepository.getSettings(user.id),
    accountService.getAccountProfile(),
  ]);

  return buildInvestmentsView({
    assets,
    snapshots,
    incomes,
    settings: settings ?? DEFAULT_SETTINGS,
    cdiBaseRate: account?.cdiBaseRate ?? DEFAULT_CDI_BASE_RATE,
  });
}

export interface InvestmentsSummary {
  totalValueFormatted: string;
  gainFormatted: string;
  yearReturnLabel: string;
}

export async function getInvestmentsSummary(): Promise<InvestmentsSummary | null> {
  const view = await getInvestmentsView();
  if (!view) return null;

  return {
    totalValueFormatted: view.portfolio.totalValueFormatted,
    gainFormatted: view.portfolio.gainFormatted,
    yearReturnLabel: view.portfolio.yearReturnLabel,
  };
}

export async function createAsset(input: CreateAssetInput): Promise<void> {
  const userId = await requireUserId();
  await assetRepository.createAsset(userId, input);
  await syncCurrentMonthSnapshot(userId);
}

export async function updateAsset(id: string, input: CreateAssetInput): Promise<void> {
  const userId = await requireUserId();
  await assetRepository.updateAsset(userId, id, input);
  await syncCurrentMonthSnapshot(userId);
}

export async function deleteAsset(id: string): Promise<void> {
  const userId = await requireUserId();
  await assetRepository.deleteAsset(userId, id);
  await syncCurrentMonthSnapshot(userId);
}

export async function updateSettings(input: UpdateInvestmentSettingsInput): Promise<void> {
  const userId = await requireUserId();
  await settingsRepository.upsertSettings(userId, input);
}

export async function createIncome(input: CreateIncomeInput): Promise<void> {
  const userId = await requireUserId();
  await incomeRepository.createIncome(userId, input);
}

export async function deleteIncome(id: string): Promise<void> {
  const userId = await requireUserId();
  await incomeRepository.deleteIncome(userId, id);
}
