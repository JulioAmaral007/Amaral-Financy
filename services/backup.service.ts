import * as backupRepository from "@/repositories/backup.repository";
import { backupFileSchema, type BackupFile } from "@/schemas/backup.schema";

export function createBackup(): BackupFile {
  return backupRepository.exportBackup();
}

/** Valida o texto do arquivo e, se for um backup do Rumo, substitui os dados locais por ele. */
export function restoreBackup(text: string): { error?: string } {
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

  backupRepository.importBackup(parsed.data);
  return {};
}
