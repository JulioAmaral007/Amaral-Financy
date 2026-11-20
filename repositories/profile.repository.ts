import { getActiveWorkspaceId } from "@/lib/active-workspace";
import { createBrowserSupabaseClient, requireUserId } from "@/lib/supabase/client";
import { unwrapMaybe } from "@/lib/supabase/errors";
import type { Profile } from "@/types/profile";

import { salariesFromRow, type WorkspaceSalariesRow } from "./rows";

const TABLE = "workspace_salaries";

const DEFAULT_PROFILE: Profile = {
  salary1: 0,
  salary2: 0,
  salary3: 0,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

export async function getProfile(): Promise<Profile> {
  const row = unwrapMaybe<WorkspaceSalariesRow>(
    await createBrowserSupabaseClient()
      .from(TABLE)
      .select("*")
      .eq("workspace_id", getActiveWorkspaceId())
      .maybeSingle(),
    "Erro ao ler os salários"
  );
  return row ? salariesFromRow(row) : DEFAULT_PROFILE;
}

export async function updateProfileSalaries(salaries: {
  salary1: number;
  salary2: number;
  salary3: number;
}): Promise<Profile> {
  const userId = await requireUserId();
  // `created_at` fica de fora: na primeira gravação vale o padrão do banco, depois permanece.
  const row = unwrapMaybe<WorkspaceSalariesRow>(
    await createBrowserSupabaseClient()
      .from(TABLE)
      .upsert(
        {
          user_id: userId,
          workspace_id: getActiveWorkspaceId(),
          ...salaries,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,workspace_id" }
      )
      .select()
      .maybeSingle(),
    "Erro ao salvar os salários"
  );
  if (!row) throw new Error("Não foi possível salvar os salários");
  return salariesFromRow(row);
}
