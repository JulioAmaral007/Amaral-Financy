import * as workspaceRepository from "@/repositories/workspace.repository";
import type { WorkspaceInput } from "@/schemas/workspace.schema";
import type { Workspace } from "@/types/workspace";

export async function getWorkspaces(): Promise<Workspace[]> {
  return workspaceRepository.listWorkspaces();
}

export async function getDeletedWorkspaces(): Promise<Workspace[]> {
  return workspaceRepository.listDeletedWorkspaces();
}

export async function getActiveWorkspace(): Promise<Workspace> {
  return workspaceRepository.getActiveWorkspace();
}

export async function switchWorkspace(id: string): Promise<void> {
  return workspaceRepository.setActiveWorkspace(id);
}

/** Cria o perfil e já o torna o ativo. */
export async function createWorkspace(input: WorkspaceInput): Promise<Workspace> {
  const workspace = await workspaceRepository.createWorkspace(input);
  await workspaceRepository.setActiveWorkspace(workspace.id);
  return workspace;
}

export async function updateWorkspace(id: string, input: WorkspaceInput): Promise<Workspace> {
  return workspaceRepository.updateWorkspace(id, input);
}

/** Remove um perfil (sem apagar seus dados). O último perfil restante não pode ser removido. */
export async function deleteWorkspace(id: string): Promise<void> {
  const available = await workspaceRepository.listWorkspaces();
  const remaining = available.filter((workspace) => workspace.id !== id);
  if (remaining.length === 0) throw new Error("É preciso manter pelo menos um perfil.");

  const active = await workspaceRepository.getActiveWorkspace();
  await workspaceRepository.deleteWorkspace(id);
  if (active.id === id) await workspaceRepository.setActiveWorkspace(remaining[0].id);
}

export async function restoreWorkspace(id: string): Promise<void> {
  return workspaceRepository.restoreWorkspace(id);
}
