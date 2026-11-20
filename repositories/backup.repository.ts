import { STORAGE_KEYS } from "@/lib/local-storage/keys";
import { readStorage, writeStorage } from "@/lib/local-storage/storage";
import type { BackupFile } from "@/schemas/backup.schema";

export function exportBackup(): BackupFile {
  return {
    app: "rumo",
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      profile: readStorage<BackupFile["data"]["profile"]>(STORAGE_KEYS.PROFILE, null),
      fixedBills: readStorage<BackupFile["data"]["fixedBills"]>(STORAGE_KEYS.FIXED_BILLS, []),
      history: readStorage<BackupFile["data"]["history"]>(STORAGE_KEYS.HISTORY, []),
      spendings: readStorage<BackupFile["data"]["spendings"]>(STORAGE_KEYS.SPENDINGS, []),
      months: readStorage<BackupFile["data"]["months"]>(STORAGE_KEYS.MONTHS, {}),
    },
  };
}

/** Substitui tudo o que está guardado pelo conteúdo do backup. */
export function importBackup(backup: BackupFile): void {
  const { data } = backup;

  if (data.profile) writeStorage(STORAGE_KEYS.PROFILE, data.profile);
  else window.localStorage.removeItem(STORAGE_KEYS.PROFILE);

  writeStorage(STORAGE_KEYS.FIXED_BILLS, data.fixedBills);
  writeStorage(STORAGE_KEYS.HISTORY, data.history);
  writeStorage(STORAGE_KEYS.SPENDINGS, data.spendings);
  writeStorage(STORAGE_KEYS.MONTHS, data.months);
}
