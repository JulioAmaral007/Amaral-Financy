/**
 * Linhas das tabelas do Supabase (snake_case) e a conversão de/para os tipos `Stored*`
 * (camelCase, com `deletedAt`) que os repositórios e o backup usam.
 *
 * O PostgREST devolve `numeric` como número e `timestamptz` como texto ISO (com o fuso do banco);
 * aqui tudo é normalizado: `Number(...)` e `toISOString()`.
 */
import type { FixedBillCategory, FixedBillPayer } from "@/types/fixed-bill";
import type { MonthSettings, SpendingCategory, SpendingInstallment, SplitMode } from "@/types/month";
import type { Profile } from "@/types/profile";
import type { Workspace } from "@/types/workspace";

// ---------------------------------------------------------------------------------------------------------------
// Tipos guardados (os mesmos que o backup em arquivo carrega)

export interface StoredWorkspace extends Workspace {
  deletedAt: string | null;
}

export interface StoredFixedBill {
  id: string;
  name: string;
  amount: number;
  category: FixedBillCategory;
  payer: FixedBillPayer;
  includedInBill: boolean;
  month: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface StoredSpending {
  id: string;
  category: SpendingCategory;
  date: string;
  amount: number;
  note: string;
  installment?: SpendingInstallment;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface StoredHistoryEntry {
  id: string;
  billAmount: number;
  salary1Payment: number;
  salary2Payment: number;
  salary3Payment: number;
  calculatedAt: string;
  month: string;
  deletedAt: string | null;
}

// ---------------------------------------------------------------------------------------------------------------
// Linhas

export interface WorkspaceRow {
  id: string;
  name: string;
  split_enabled: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface WorkspaceSalariesRow {
  workspace_id: string;
  salary1: number;
  salary2: number;
  salary3: number;
  created_at: string;
  updated_at: string;
}

export interface FixedBillRow {
  id: string;
  workspace_id: string;
  month: string;
  name: string;
  amount: number;
  category: FixedBillCategory;
  payer: FixedBillPayer;
  included_in_bill: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SpendingRow {
  id: string;
  workspace_id: string;
  category: SpendingCategory;
  date: string;
  amount: number;
  note: string;
  installment_group_id: string | null;
  installment_number: number | null;
  installment_total: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface HistoryEntryRow {
  id: string;
  workspace_id: string;
  month: string;
  bill_amount: number;
  salary1_payment: number;
  salary2_payment: number;
  salary3_payment: number;
  calculated_at: string;
  deleted_at: string | null;
}

export interface MonthSettingsRow {
  workspace_id: string;
  month: string;
  inss: number;
  extra_pai: number;
  split_mode: SplitMode;
  budgets: Partial<Record<SpendingCategory, number>> | null;
}

// ---------------------------------------------------------------------------------------------------------------
// Conversões

function iso(value: string): string {
  return new Date(value).toISOString();
}

function isoOrNull(value: string | null): string | null {
  return value ? iso(value) : null;
}

export function workspaceFromRow(row: WorkspaceRow): StoredWorkspace {
  return {
    id: row.id,
    name: row.name,
    splitEnabled: row.split_enabled,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    deletedAt: isoOrNull(row.deleted_at),
  };
}

export function workspaceToRow(workspace: StoredWorkspace): WorkspaceRow {
  return {
    id: workspace.id,
    name: workspace.name,
    split_enabled: workspace.splitEnabled,
    created_at: workspace.createdAt,
    updated_at: workspace.updatedAt,
    deleted_at: workspace.deletedAt,
  };
}

export function salariesFromRow(row: WorkspaceSalariesRow): Profile {
  return {
    salary1: Number(row.salary1),
    salary2: Number(row.salary2),
    salary3: Number(row.salary3),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export function salariesToRow(workspaceId: string, profile: Profile): WorkspaceSalariesRow {
  return {
    workspace_id: workspaceId,
    salary1: profile.salary1,
    salary2: profile.salary2,
    salary3: profile.salary3,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt,
  };
}

export function fixedBillFromRow(row: FixedBillRow): StoredFixedBill {
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    category: row.category,
    payer: row.payer,
    includedInBill: row.included_in_bill,
    month: row.month,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    deletedAt: isoOrNull(row.deleted_at),
  };
}

export function fixedBillToRow(workspaceId: string, bill: StoredFixedBill): FixedBillRow {
  return {
    id: bill.id,
    workspace_id: workspaceId,
    month: bill.month,
    name: bill.name,
    amount: bill.amount,
    category: bill.category,
    payer: bill.payer,
    included_in_bill: bill.includedInBill,
    created_at: bill.createdAt,
    updated_at: bill.updatedAt,
    deleted_at: bill.deletedAt,
  };
}

export function spendingFromRow(row: SpendingRow): StoredSpending {
  const hasInstallment =
    row.installment_group_id !== null && row.installment_number !== null && row.installment_total !== null;

  return {
    id: row.id,
    category: row.category,
    date: row.date,
    amount: Number(row.amount),
    note: row.note,
    ...(hasInstallment
      ? {
          installment: {
            groupId: row.installment_group_id ?? "",
            number: row.installment_number ?? 1,
            total: row.installment_total ?? 1,
          },
        }
      : {}),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    deletedAt: isoOrNull(row.deleted_at),
  };
}

export function spendingToRow(workspaceId: string, spending: StoredSpending): SpendingRow {
  return {
    id: spending.id,
    workspace_id: workspaceId,
    category: spending.category,
    date: spending.date,
    amount: spending.amount,
    note: spending.note,
    installment_group_id: spending.installment?.groupId ?? null,
    installment_number: spending.installment?.number ?? null,
    installment_total: spending.installment?.total ?? null,
    created_at: spending.createdAt,
    updated_at: spending.updatedAt,
    deleted_at: spending.deletedAt,
  };
}

export function historyEntryFromRow(row: HistoryEntryRow): StoredHistoryEntry {
  return {
    id: row.id,
    billAmount: Number(row.bill_amount),
    salary1Payment: Number(row.salary1_payment),
    salary2Payment: Number(row.salary2_payment),
    salary3Payment: Number(row.salary3_payment),
    calculatedAt: iso(row.calculated_at),
    month: row.month,
    deletedAt: isoOrNull(row.deleted_at),
  };
}

export function historyEntryToRow(
  workspaceId: string,
  entry: Omit<StoredHistoryEntry, "month"> & { month?: string }
): HistoryEntryRow {
  return {
    id: entry.id,
    workspace_id: workspaceId,
    // Registros antigos do backup podem não ter o mês: cai para o mês do cálculo.
    month: entry.month ?? entry.calculatedAt.slice(0, 7),
    bill_amount: entry.billAmount,
    salary1_payment: entry.salary1Payment,
    salary2_payment: entry.salary2Payment,
    salary3_payment: entry.salary3Payment,
    calculated_at: entry.calculatedAt,
    deleted_at: entry.deletedAt,
  };
}

const BUDGET_CATEGORIES: SpendingCategory[] = ["Carne", "Gasolina", "Mercado", "Outros"];

export function monthSettingsFromRow(row: MonthSettingsRow): MonthSettings {
  const budgets = { Carne: 0, Gasolina: 0, Mercado: 0, Outros: 0 };
  for (const category of BUDGET_CATEGORIES) budgets[category] = Number(row.budgets?.[category] ?? 0);

  return {
    month: row.month,
    inss: Number(row.inss),
    extraPai: Number(row.extra_pai),
    splitMode: row.split_mode,
    budgets,
  };
}

export function monthSettingsToRow(workspaceId: string, settings: MonthSettings): MonthSettingsRow {
  return {
    workspace_id: workspaceId,
    month: settings.month,
    inss: settings.inss,
    extra_pai: settings.extraPai,
    split_mode: settings.splitMode,
    budgets: settings.budgets,
  };
}
