/**
 * Perfil (workspace) ativo neste navegador. Os perfis e todos os dados ficam no
 * Supabase; aqui guardamos só QUAL perfil está aberto — uma preferência do
 * aparelho, lida de forma síncrona pelos repositórios.
 */
export const DEFAULT_WORKSPACE_ID = "casa";

const ACTIVE_WORKSPACE_STORAGE_KEY = "financy:active-workspace";

export function getActiveWorkspaceId(): string {
  if (typeof window === "undefined") return DEFAULT_WORKSPACE_ID;

  try {
    return window.localStorage.getItem(ACTIVE_WORKSPACE_STORAGE_KEY) || DEFAULT_WORKSPACE_ID;
  } catch {
    return DEFAULT_WORKSPACE_ID;
  }
}

export function setActiveWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(ACTIVE_WORKSPACE_STORAGE_KEY, workspaceId);
}

/** Esquece a escolha (ao entrar/sair da conta): o id de um usuário não vale para outro. */
export function clearActiveWorkspaceId(): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(ACTIVE_WORKSPACE_STORAGE_KEY);
  } catch {
    // Sem acesso ao armazenamento: o perfil padrão é usado.
  }
}
