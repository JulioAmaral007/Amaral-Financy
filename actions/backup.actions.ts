import * as backupService from "@/services/backup.service";

export interface BackupActionState {
  error?: string;
}

/** JSON do backup (formatado) com todos os dados da conta, pronto para baixar. */
export async function exportBackupAction(): Promise<string> {
  return JSON.stringify(await backupService.createBackup(), null, 2);
}

export async function importBackupAction(text: string): Promise<BackupActionState> {
  try {
    return await backupService.restoreBackup(text);
  } catch {
    return { error: "Não foi possível importar o backup. Nada foi alterado, tente de novo." };
  }
}
