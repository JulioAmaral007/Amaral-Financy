import { toast } from "sonner";

/**
 * Os dados vêm do Supabase pela rede; se uma seção não conseguir carregar, avisa uma vez só
 * (o `id` junta os avisos de várias seções) em vez de deixar a tela em branco sem explicação.
 */
export function notifyLoadError(error: unknown): void {
  console.error(error);
  toast.error("Não foi possível carregar seus dados. Confira a conexão e recarregue a página.", {
    id: "load-error",
  });
}
