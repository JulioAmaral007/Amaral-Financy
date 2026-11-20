/**
 * Variáveis públicas do projeto Supabase (`.env.local`). Cada uma é lida pelo nome
 * literal para o Next conseguir embuti-la no bundle do navegador.
 */
export function getSupabaseEnv(): { url: string; publishableKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Defina NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY em .env.local (veja supabase/SETUP.md)."
    );
  }

  return { url, publishableKey };
}
