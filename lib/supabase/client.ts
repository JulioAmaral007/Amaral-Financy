import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv } from "./env";

/** Cliente do navegador (a sessão fica em cookies, os mesmos que o `proxy.ts` e as server actions leem). */
export function createBrowserSupabaseClient() {
  const { url, publishableKey } = getSupabaseEnv();
  return createBrowserClient(url, publishableKey);
}

/** Id do usuário logado, lido da sessão local (sem ida ao servidor). Falha se não houver sessão. */
export async function requireUserId(): Promise<string> {
  const { data, error } = await createBrowserSupabaseClient().auth.getSession();
  if (error || !data.session) throw new Error("Sessão expirada. Entre novamente.");
  return data.session.user.id;
}
