import * as backupRepository from "@/repositories/backup.repository";
import { backupFileSchema, type BackupFile } from "@/schemas/backup.schema";

export async function createBackup(): Promise<BackupFile> {
  return backupRepository.exportBackup();
}

/** Valida o texto do arquivo e, se for um backup do Rumo, substitui os dados da conta por ele. */
export async function restoreBackup(text: string): Promise<{ error?: string }> {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { error: "O arquivo não é um JSON válido." };
  }

  const parsed = backupFileSchema.safeParse(json);
  if (!parsed.success) {
    return { error: "O arquivo não é um backup do Rumo ou está com dados inválidos." };
  }

  await backupRepository.importBackup(parsed.data);
  return {};
}
