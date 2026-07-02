import { updateProfileNameSchema, type UpdateProfileNameInput } from "@/schemas/profile.schema";
import * as profileService from "@/services/profile.service";

export interface ProfileActionState {
  error?: string;
  success?: boolean;
}

export async function updateDisplayNameAction(
  input: UpdateProfileNameInput
): Promise<ProfileActionState> {
  const parsed = updateProfileNameSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  try {
    await profileService.updateDisplayName(parsed.data.fullName);
  } catch {
    return { error: "Erro ao atualizar perfil. Tente novamente." };
  }

  return { success: true };
}
