/**
 * Tema da interface: "system" segue o sistema operacional; "light"/"dark"
 * forçam um tema. A escolha fica no localStorage deste navegador (não entra no
 * backup, é preferência de tela) e vira o atributo `data-theme` do <html>.
 */
export type ThemePreference = "system" | "light" | "dark";

export const THEME_STORAGE_KEY = "rumo:theme";
const THEME_EVENT = "rumo:theme-changed";

/**
 * Roda no <head>, antes da primeira pintura, para não piscar o tema errado.
 * Precisa ser autocontido: é injetado como texto.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export function getThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

export function setThemePreference(preference: ThemePreference): void {
  const root = document.documentElement;
  try {
    if (preference === "system") window.localStorage.removeItem(THEME_STORAGE_KEY);
    else window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // Sem storage (aba privada, bloqueio): o tema vale só até recarregar.
  }
  if (preference === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", preference);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function onThemePreferenceChange(callback: () => void): () => void {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
