import * as backupService from "@/services/backup.service";

export interface BackupActionState {
  error?: string;
}

/** JSON do backup (formatado) com todos os dados locais, pronto para baixar. */
export async function exportBackupAction(): Promise<string> {
  return JSON.stringify(backupService.createBackup(), null, 2);
}

export async function importBackupAction(text: string): Promise<BackupActionState> {
  return backupService.restoreBackup(text);
}
