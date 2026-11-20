import { monthKeyFromDate, shiftMonth } from "@/lib/month";
import { round2 } from "@/lib/utils";
import * as fixedBillRepository from "@/repositories/fixed-bill.repository";
import * as monthSettingsRepository from "@/repositories/month-settings.repository";
import * as profileRepository from "@/repositories/profile.repository";
import * as spendingRepository from "@/repositories/spending.repository";
import type { FixedBill } from "@/types/fixed-bill";
import type { Profile } from "@/types/profile";
import type { MonthKey, MonthSettings, MonthTotals, Spending, SpendingCategory } from "@/types/month";

import { sumIncludedFixedBills } from "./fixed-bill.service";

export const EMPTY_BUDGETS: Record<SpendingCategory, number> = {
  Carne: 0,
  Gasolina: 0,
  Mercado: 0,
  Outros: 0,
};

export interface MonthSnapshot {
  month: MonthKey;
  settings: MonthSettings;
  profile: Profile;
  bills: FixedBill[];
  spendings: Spending[];
  totals: MonthTotals;
}

/** O "TOTAL" da planilha: contas somadas do mês + o que foi gasto no cartão. */
export function computeMonthTotals(bills: FixedBill[], spendings: Spending[]): MonthTotals {
  const billsTotal = round2(sumIncludedFixedBills(bills));
  const spendingTotal = round2(spendings.reduce((sum, spending) => sum + spending.amount, 0));
  return { bills: billsTotal, spending: spendingTotal, total: round2(billsTotal + spendingTotal) };
}

/** Gasto, estimado e saldo (estimado − gasto) de cada categoria. */
export function summarizeSpendingByCategory(
  spendings: Spending[],
  budgets: Record<SpendingCategory, number>
): Array<{ category: SpendingCategory; budget: number; spent: number; balance: number }> {
  return (Object.keys(EMPTY_BUDGETS) as SpendingCategory[]).map((category) => {
    const spent = round2(
      spendings.filter((spending) => spending.category === category).reduce((sum, s) => sum + s.amount, 0)
    );
    const budget = budgets[category];
    return { category, budget, spent, balance: round2(budget - spent) };
  });
}

/**
 * Ajustes do mês. Um mês ainda sem ajustes próprios herda INSS, estimativas e
 * modo de divisão do mês anterior mais recente (como duplicar a aba da
 * planilha); o extra do pai começa zerado. Sem nenhum mês anterior, o INSS
 * vem do salário 1 salvo no perfil.
 */
export async function getMonthSettings(month: MonthKey): Promise<MonthSettings> {
  const stored = await monthSettingsRepository.getMonthSettings(month);
  if (stored) return stored;

  const previous = await monthSettingsRepository.getLatestMonthSettingsBefore(month);
  if (previous) {
    return { ...previous, month, extraPai: 0, budgets: { ...previous.budgets } };
  }

  const profile = await profileRepository.getProfile();
  return { month, inss: profile.salary1, extraPai: 0, splitMode: "equal", budgets: { ...EMPTY_BUDGETS } };
}

export async function updateMonthSettings(
  month: MonthKey,
  patch: Partial<Omit<MonthSettings, "month">>
): Promise<MonthSettings> {
  const base = await getMonthSettings(month);
  return monthSettingsRepository.saveMonthSettings({
    ...base,
    ...patch,
    budgets: { ...base.budgets, ...patch.budgets },
    month,
  });
}

export async function getMonthSnapshot(month: MonthKey): Promise<MonthSnapshot> {
  const [settings, profile, bills, spendings] = await Promise.all([
    getMonthSettings(month),
    profileRepository.getProfile(),
    fixedBillRepository.listFixedBillsForMonth(month),
    spendingRepository.listSpendingsForMonth(month),
  ]);

  return { month, settings, profile, bills, spendings, totals: computeMonthTotals(bills, spendings) };
}

/** Total (contas somadas + cartão) de cada mês que tem algum lançamento. */
export async function getTotalsByMonth(): Promise<Record<MonthKey, number>> {
  const [bills, spendings] = await Promise.all([
    fixedBillRepository.listAllFixedBills(),
    spendingRepository.listAllSpendings(),
  ]);

  const billsByMonth = new Map<MonthKey, FixedBill[]>();
  for (const bill of bills) {
    billsByMonth.set(bill.month, [...(billsByMonth.get(bill.month) ?? []), bill]);
  }

  const spendingsByMonth = new Map<MonthKey, Spending[]>();
  for (const spending of spendings) {
    const month = monthKeyFromDate(spending.date);
    spendingsByMonth.set(month, [...(spendingsByMonth.get(month) ?? []), spending]);
  }

  const months = new Set([...billsByMonth.keys(), ...spendingsByMonth.keys()]);
  const totals: Record<MonthKey, number> = {};
  for (const month of months) {
    totals[month] = computeMonthTotals(billsByMonth.get(month) ?? [], spendingsByMonth.get(month) ?? []).total;
  }
  return totals;
}

/** Copia as contas do mês anterior para `month`; devolve quantas foram copiadas. */
export async function copyBillsFromPreviousMonth(month: MonthKey): Promise<number> {
  return fixedBillRepository.copyFixedBills(shiftMonth(month, -1), month);
}
