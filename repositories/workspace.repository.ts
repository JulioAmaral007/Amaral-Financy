import { DEFAULT_WORKSPACE_ID, getActiveWorkspaceId, setActiveWorkspaceId } from "@/lib/active-workspace";
import { createBrowserSupabaseClient, requireUserId } from "@/lib/supabase/client";
import { assertNoError, unwrapList, unwrapMaybe } from "@/lib/supabase/errors";
import type { Workspace } from "@/types/workspace";

import { workspaceFromRow, workspaceToRow, type StoredWorkspace, type WorkspaceRow } from "./rows";

export type { StoredWorkspace };

const TABLE = "workspaces";

function defaultWorkspace(): StoredWorkspace {
  // Época como data de criação: o perfil padrão sempre fica primeiro na lista.
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

/**
 * Todos os perfis da conta, inclusive os removidos. Conta nova (sem nenhum perfil) ganha o padrão
 * "Casa", criado aqui na primeira leitura.
 */
export async function readAllStoredWorkspaces(): Promise<StoredWorkspace[]> {
  const supabase = createBrowserSupabaseClient();
  const rows = unwrapList<WorkspaceRow>(
    await supabase.from(TABLE).select("*").order("created_at").order("id"),
    "Erro ao listar os perfis"
  );
  if (rows.length > 0) return rows.map(workspaceFromRow);

  const fallback = defaultWorkspace();
  const userId = await requireUserId();
  // `ignoreDuplicates`: duas leituras simultâneas não brigam pela criação do perfil padrão.
  const { error } = await supabase
    .from(TABLE)
    .upsert({ user_id: userId, ...workspaceToRow(fallback) }, { onConflict: "user_id,id", ignoreDuplicates: true });
  assertNoError(error, "Erro ao criar o perfil padrão");
  return [fallback];
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
  return (await readAllStoredWorkspaces()).filter((workspace) => !workspace.deletedAt).map(stripDeleted);
}

/** Perfis removidos (com os dados ainda guardados), que podem ser restaurados. */
export async function listDeletedWorkspaces(): Promise<Workspace[]> {
  return (await readAllStoredWorkspaces()).filter((workspace) => workspace.deletedAt).map(stripDeleted);
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
  // Garante que o perfil padrão já exista antes de somar outro à lista.
  await readAllStoredWorkspaces();

  const now = new Date().toISOString();
  const workspace: StoredWorkspace = {
    id: crypto.randomUUID(),
    name: input.name,
    splitEnabled: input.splitEnabled,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };

  const { error } = await createBrowserSupabaseClient().from(TABLE).insert(workspaceToRow(workspace));
  assertNoError(error, "Erro ao criar o perfil");
  return stripDeleted(workspace);
}

export async function updateWorkspace(
  id: string,
  input: { name: string; splitEnabled: boolean }
): Promise<Workspace> {
  const row = unwrapMaybe<WorkspaceRow>(
    await createBrowserSupabaseClient()
      .from(TABLE)
      .update({ name: input.name, split_enabled: input.splitEnabled, updated_at: new Date().toISOString() })
      .eq("id", id)
      .is("deleted_at", null)
      .select()
      .maybeSingle(),
    "Erro ao atualizar o perfil"
  );
  if (!row) throw new Error("Perfil não encontrado");
  return stripDeleted(workspaceFromRow(row));
}

/** Soft delete: os dados do perfil permanecem guardados e voltam com o "Desfazer". */
export async function deleteWorkspace(id: string): Promise<void> {
  const { error } = await createBrowserSupabaseClient()
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null);
  assertNoError(error, "Erro ao remover o perfil");
}

export async function restoreWorkspace(id: string): Promise<void> {
  const { error } = await createBrowserSupabaseClient()
    .from(TABLE)
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq("id", id)
    .not("deleted_at", "is", null);
  assertNoError(error, "Erro ao restaurar o perfil");
}
