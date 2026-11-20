import { workspaceSchema, type WorkspaceInput } from "@/schemas/workspace.schema";
import * as workspaceService from "@/services/workspace.service";

export interface WorkspaceActionState {
  error?: string;
}

export async function switchWorkspaceAction(id: string): Promise<WorkspaceActionState> {
  try {
    await workspaceService.switchWorkspace(id);
  } catch {
    return { error: "Perfil não encontrado." };
  }

  return {};
}

export async function createWorkspaceAction(input: WorkspaceInput): Promise<WorkspaceActionState> {
  const parsed = workspaceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await workspaceService.createWorkspace(parsed.data);
  } catch {
    return { error: "Erro ao criar o perfil. Tente novamente." };
  }

  return {};
}

export async function updateWorkspaceAction(id: string, input: WorkspaceInput): Promise<WorkspaceActionState> {
  const parsed = workspaceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await workspaceService.updateWorkspace(id, parsed.data);
  } catch {
    return { error: "Erro ao atualizar o perfil. Tente novamente." };
  }

  return {};
}

export async function deleteWorkspaceAction(id: string): Promise<WorkspaceActionState> {
  try {
    await workspaceService.deleteWorkspace(id);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Erro ao remover o perfil." };
  }

  return {};
}

export async function restoreWorkspaceAction(id: string): Promise<void> {
  await workspaceService.restoreWorkspace(id);
}
