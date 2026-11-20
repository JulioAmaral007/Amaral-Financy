import {
  DEFAULT_WORKSPACE_ID,
  WORKSPACE_STORAGE_KEYS,
  getActiveWorkspaceId,
  setActiveWorkspaceId,
} from "@/lib/local-storage/keys";
import { readStorage, writeStorage } from "@/lib/local-storage/storage";
import type { Workspace } from "@/types/workspace";

export interface StoredWorkspace extends Workspace {
  deletedAt: string | null;
}

function defaultWorkspace(): StoredWorkspace {
  const epoch = new Date(0).toISOString();
  return {
    id: DEFAULT_WORKSPACE_ID,
    name: "Casa",
    splitEnabled: true,
    createdAt: epoch,
    updatedAt: epoch,
    deletedAt: null,
  };
}

/** Sem lista salva, existe só o perfil padrão "Casa" (os dados que já havia antes dos perfis). */
export function readAllStoredWorkspaces(): StoredWorkspace[] {
  const stored = readStorage<StoredWorkspace[]>(WORKSPACE_STORAGE_KEYS.LIST, []);
  return stored.length > 0 ? stored : [defaultWorkspace()];
}

function writeAll(workspaces: StoredWorkspace[]): void {
  writeStorage(WORKSPACE_STORAGE_KEYS.LIST, workspaces);
}

function stripDeleted(workspace: StoredWorkspace): Workspace {
  return {
    id: workspace.id,
    name: workspace.name,
    splitEnabled: workspace.splitEnabled,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
}

export async function listWorkspaces(): Promise<Workspace[]> {
  return readAllStoredWorkspaces()
    .filter((workspace) => !workspace.deletedAt)
    .map(stripDeleted);
}

/** Perfis removidos (com os dados ainda guardados), que podem ser restaurados. */
export async function listDeletedWorkspaces(): Promise<Workspace[]> {
  return readAllStoredWorkspaces()
    .filter((workspace) => workspace.deletedAt)
    .map(stripDeleted);
}

/** Perfil ativo; se o salvo não existe mais, cai para o primeiro disponível e corrige a escolha. */
export async function getActiveWorkspace(): Promise<Workspace> {
  const available = await listWorkspaces();
  const activeId = getActiveWorkspaceId();
  const active = available.find((workspace) => workspace.id === activeId);
  if (active) return active;

  const fallback = available[0] ?? stripDeleted(defaultWorkspace());
  setActiveWorkspaceId(fallback.id);
  return fallback;
}

export async function setActiveWorkspace(id: string): Promise<void> {
  const exists = (await listWorkspaces()).some((workspace) => workspace.id === id);
  if (!exists) throw new Error("Perfil não encontrado");

  setActiveWorkspaceId(id);
}

export async function createWorkspace(input: { name: string; splitEnabled: boolean }): Promise<Workspace> {
  const now = new Date().toISOString();
  const workspace: StoredWorkspace = {
    id: crypto.randomUUID(),
    name: input.name,
    splitEnabled: input.splitEnabled,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  // Ao criar o primeiro perfil extra, o padrão "Casa" passa a ficar salvo explicitamente.
  writeAll([...readAllStoredWorkspaces(), workspace]);
  return stripDeleted(workspace);
}

export async function updateWorkspace(
  id: string,
  input: { name: string; splitEnabled: boolean }
): Promise<Workspace> {
  const all = readAllStoredWorkspaces();
  const index = all.findIndex((workspace) => workspace.id === id && !workspace.deletedAt);
  if (index === -1) throw new Error("Perfil não encontrado");

  all[index] = { ...all[index], ...input, updatedAt: new Date().toISOString() };
  writeAll(all);
  return stripDeleted(all[index]);
}

/** Soft delete: os dados do perfil permanecem guardados e voltam com o "Desfazer". */
export async function deleteWorkspace(id: string): Promise<void> {
  const all = readAllStoredWorkspaces();
  const index = all.findIndex((workspace) => workspace.id === id && !workspace.deletedAt);
  if (index === -1) return;

  all[index] = { ...all[index], deletedAt: new Date().toISOString() };
  writeAll(all);
}

export async function restoreWorkspace(id: string): Promise<void> {
  const all = readAllStoredWorkspaces();
  const index = all.findIndex((workspace) => workspace.id === id && workspace.deletedAt);
  if (index === -1) return;

  all[index] = { ...all[index], deletedAt: null, updatedAt: new Date().toISOString() };
  writeAll(all);
}
