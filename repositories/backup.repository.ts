import { DEFAULT_WORKSPACE_ID, getActiveWorkspaceId, setActiveWorkspaceId } from "@/lib/active-workspace";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { assertNoError, fetchAllPages } from "@/lib/supabase/errors";
import type { BackupFile, BackupWorkspaceData } from "@/schemas/backup.schema";

import {
  fixedBillFromRow,
  fixedBillToRow,
  historyEntryFromRow,
  historyEntryToRow,
  monthSettingsFromRow,
  monthSettingsToRow,
  salariesFromRow,
  salariesToRow,
  spendingFromRow,
  spendingToRow,
  workspaceToRow,
  type FixedBillRow,
  type HistoryEntryRow,
  type MonthSettingsRow,
  type SpendingRow,
  type WorkspaceSalariesRow,
} from "./rows";
import { readAllStoredWorkspaces } from "./workspace.repository";

/**
 * Lê TUDO da conta (inclusive o que foi removido com soft delete), em páginas de 1000 linhas.
 * `orderColumns` precisa identificar a linha de forma única, senão a paginação pode repetir ou pular linhas.
 */
function readEverything<T>(table: string, orderColumns: string[]): Promise<T[]> {
  return fetchAllPages<T>((from, to) => {
    let query = createBrowserSupabaseClient().from(table).select("*");
    for (const column of orderColumns) query = query.order(column);
    return query.range(from, to);
  }, `Erro ao ler ${table}`);
}

function groupByWorkspace<T extends { workspace_id: string }>(rows: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const row of rows) groups.set(row.workspace_id, [...(groups.get(row.workspace_id) ?? []), row]);
  return groups;
}

export async function exportBackup(): Promise<BackupFile> {
  const [workspaces, salaries, fixedBills, spendings, history, months] = await Promise.all([
    readAllStoredWorkspaces(),
    readEverything<WorkspaceSalariesRow>("workspace_salaries", ["workspace_id"]),
    readEverything<FixedBillRow>("fixed_bills", ["id"]),
    readEverything<SpendingRow>("spendings", ["id"]),
    readEverything<HistoryEntryRow>("history_entries", ["id"]),
    readEverything<MonthSettingsRow>("month_settings", ["workspace_id", "month"]),
  ]);

  const salariesByWorkspace = groupByWorkspace(salaries);
  const billsByWorkspace = groupByWorkspace(fixedBills);
  const spendingsByWorkspace = groupByWorkspace(spendings);
  const historyByWorkspace = groupByWorkspace(history);
  const monthsByWorkspace = groupByWorkspace(months);

  return {
    app: "rumo",
    version: 2,
    exportedAt: new Date().toISOString(),
    activeWorkspaceId: getActiveWorkspaceId(),
    workspaces: workspaces.map((workspace) => {
      const salaryRow = salariesByWorkspace.get(workspace.id)?.[0];
      const data: BackupWorkspaceData = {
        profile: salaryRow ? salariesFromRow(salaryRow) : null,
        fixedBills: (billsByWorkspace.get(workspace.id) ?? []).map(fixedBillFromRow),
        history: (historyByWorkspace.get(workspace.id) ?? []).map(historyEntryFromRow),
        spendings: (spendingsByWorkspace.get(workspace.id) ?? []).map(spendingFromRow),
        months: Object.fromEntries(
          (monthsByWorkspace.get(workspace.id) ?? []).map((row) => [row.month, monthSettingsFromRow(row)])
        ),
      };
      return { ...workspace, data };
    }),
  };
}

/**
 * Substitui TUDO o que a conta guarda (todos os perfis) pelo conteúdo do backup. A troca roda numa
 * transação só (função `replace_all_data` do banco): se algo falhar, nada muda.
 */
export async function importBackup(backup: BackupFile): Promise<void> {
  const payload = {
    workspaces: backup.workspaces.map((workspace) => workspaceToRow(workspace)),
    workspace_salaries: backup.workspaces.flatMap((workspace) =>
      workspace.data.profile ? [salariesToRow(workspace.id, workspace.data.profile)] : []
    ),
    fixed_bills: backup.workspaces.flatMap((workspace) =>
      workspace.data.fixedBills.map((bill) => fixedBillToRow(workspace.id, bill))
    ),
    spendings: backup.workspaces.flatMap((workspace) =>
      workspace.data.spendings.map((spending) => spendingToRow(workspace.id, spending))
    ),
    history_entries: backup.workspaces.flatMap((workspace) =>
      workspace.data.history.map((entry) => historyEntryToRow(workspace.id, entry))
    ),
    month_settings: backup.workspaces.flatMap((workspace) =>
      Object.values(workspace.data.months).map((settings) => monthSettingsToRow(workspace.id, settings))
    ),
  };

  const { error } = await createBrowserSupabaseClient().rpc("replace_all_data", { payload });
  assertNoError(error, "Erro ao importar o backup");

  const active = backup.workspaces.find(
    (workspace) => workspace.id === backup.activeWorkspaceId && !workspace.deletedAt
  );
  const fallback = backup.workspaces.find((workspace) => !workspace.deletedAt);
  setActiveWorkspaceId((active ?? fallback)?.id ?? DEFAULT_WORKSPACE_ID);
}
