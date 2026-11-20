/**
 * Cada perfil (workspace) tem seu próprio conjunto de dados no localStorage.
 *
 * - O perfil padrão ("casa") usa as chaves originais (`financy:fixed-bills`…),
 *   então quem já tinha dados não precisa de migração.
 * - Os demais usam `financy:ws:<id>:<nome>`.
 *
 * `STORAGE_KEYS.X` resolve a chave do perfil ATIVO a cada leitura (getters),
 * por isso os repositórios continuam usando `STORAGE_KEYS.X` normalmente.
 */
export const DEFAULT_WORKSPACE_ID = "casa";

export const WORKSPACE_KEY_PREFIX = "financy:ws:";

/** Chaves globais (não pertencem a nenhum perfil). */
export const WORKSPACE_STORAGE_KEYS = {
  LIST: "financy:workspaces",
  ACTIVE: "financy:active-workspace",
} as const;

export const WORKSPACE_DATA_NAMES = ["profile", "fixed-bills", "history", "spendings", "months"] as const;

export type WorkspaceDataName = (typeof WORKSPACE_DATA_NAMES)[number];

export function workspaceDataKey(workspaceId: string, name: WorkspaceDataName): string {
  return workspaceId === DEFAULT_WORKSPACE_ID ? `financy:${name}` : `${WORKSPACE_KEY_PREFIX}${workspaceId}:${name}`;
}

export function getActiveWorkspaceId(): string {
  if (typeof window === "undefined") return DEFAULT_WORKSPACE_ID;

  try {
    return window.localStorage.getItem(WORKSPACE_STORAGE_KEYS.ACTIVE) || DEFAULT_WORKSPACE_ID;
  } catch {
    return DEFAULT_WORKSPACE_ID;
  }
}

export function setActiveWorkspaceId(workspaceId: string): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(WORKSPACE_STORAGE_KEYS.ACTIVE, workspaceId);
}

export const STORAGE_KEYS = {
  get PROFILE() {
    return workspaceDataKey(getActiveWorkspaceId(), "profile");
  },
  get FIXED_BILLS() {
    return workspaceDataKey(getActiveWorkspaceId(), "fixed-bills");
  },
  get HISTORY() {
    return workspaceDataKey(getActiveWorkspaceId(), "history");
  },
  get SPENDINGS() {
    return workspaceDataKey(getActiveWorkspaceId(), "spendings");
  },
  get MONTHS() {
    return workspaceDataKey(getActiveWorkspaceId(), "months");
  },
};
