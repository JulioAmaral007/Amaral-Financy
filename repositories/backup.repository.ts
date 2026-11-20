import {
  DEFAULT_WORKSPACE_ID,
  WORKSPACE_DATA_NAMES,
  WORKSPACE_KEY_PREFIX,
  WORKSPACE_STORAGE_KEYS,
  getActiveWorkspaceId,
  workspaceDataKey,
} from "@/lib/local-storage/keys";
import { readStorage, writeStorage } from "@/lib/local-storage/storage";
import type { BackupFile, BackupWorkspaceData } from "@/schemas/backup.schema";

import { readAllStoredWorkspaces } from "./workspace.repository";

function readWorkspaceData(workspaceId: string): BackupWorkspaceData {
  return {
    profile: readStorage<BackupWorkspaceData["profile"]>(workspaceDataKey(workspaceId, "profile"), null),
    fixedBills: readStorage<BackupWorkspaceData["fixedBills"]>(workspaceDataKey(workspaceId, "fixed-bills"), []),
    history: readStorage<BackupWorkspaceData["history"]>(workspaceDataKey(workspaceId, "history"), []),
    spendings: readStorage<BackupWorkspaceData["spendings"]>(workspaceDataKey(workspaceId, "spendings"), []),
    months: readStorage<BackupWorkspaceData["months"]>(workspaceDataKey(workspaceId, "months"), {}),
  };
}

function writeWorkspaceData(workspaceId: string, data: BackupWorkspaceData): void {
  if (data.profile) writeStorage(workspaceDataKey(workspaceId, "profile"), data.profile);
  writeStorage(workspaceDataKey(workspaceId, "fixed-bills"), data.fixedBills);
  writeStorage(workspaceDataKey(workspaceId, "history"), data.history);
  writeStorage(workspaceDataKey(workspaceId, "spendings"), data.spendings);
  writeStorage(workspaceDataKey(workspaceId, "months"), data.months);
}

/** Apaga tudo o que o app guarda (todos os perfis), sem tocar em chaves de outros sites/apps. */
function clearAllAppData(): void {
  const storage = window.localStorage;

  for (const name of WORKSPACE_DATA_NAMES) storage.removeItem(workspaceDataKey(DEFAULT_WORKSPACE_ID, name));
  storage.removeItem(WORKSPACE_STORAGE_KEYS.LIST);
  storage.removeItem(WORKSPACE_STORAGE_KEYS.ACTIVE);

  const extraKeys: string[] = [];
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (key?.startsWith(WORKSPACE_KEY_PREFIX)) extraKeys.push(key);
  }
  extraKeys.forEach((key) => storage.removeItem(key));
}

export function exportBackup(): BackupFile {
  return {
    app: "rumo",
    version: 2,
    exportedAt: new Date().toISOString(),
    activeWorkspaceId: getActiveWorkspaceId(),
    workspaces: readAllStoredWorkspaces().map((workspace) => ({
      ...workspace,
      data: readWorkspaceData(workspace.id),
    })),
  };
}

/** Substitui tudo o que está guardado (todos os perfis) pelo conteúdo do backup. */
export function importBackup(backup: BackupFile): void {
  clearAllAppData();

  for (const workspace of backup.workspaces) {
    writeWorkspaceData(workspace.id, workspace.data);
  }

  writeStorage(
    WORKSPACE_STORAGE_KEYS.LIST,
    backup.workspaces.map((workspace) => ({
      id: workspace.id,
      name: workspace.name,
      splitEnabled: workspace.splitEnabled,
      createdAt: workspace.createdAt,
      updatedAt: workspace.updatedAt,
      deletedAt: workspace.deletedAt,
    }))
  );

  const active = backup.workspaces.find(
    (workspace) => workspace.id === backup.activeWorkspaceId && !workspace.deletedAt
  );
  const fallback = backup.workspaces.find((workspace) => !workspace.deletedAt);
  window.localStorage.setItem(WORKSPACE_STORAGE_KEYS.ACTIVE, (active ?? fallback)?.id ?? DEFAULT_WORKSPACE_ID);
}
