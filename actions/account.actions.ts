"use server";

import { revalidatePath } from "next/cache";

import { updateAccountNameSchema, updateCdiRateSchema, updateNotificationPrefsSchema } from "@/schemas/account.schema";
import * as accountService from "@/services/account.service";

export interface AccountActionState {
  error?: string;
}

export async function updateAccountNameAction(input: unknown): Promise<AccountActionState> {
  const parsed = updateAccountNameSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    await accountService.updateAccountName(parsed.data.name);
  } catch {
    return { error: "Erro ao salvar. Tente novamente." };
  }

  revalidatePath("/profile");
  return {};
}

export async function updateCdiRateAction(input: unknown): Promise<AccountActionState> {
  const parsed = updateCdiRateSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    await accountService.updateAccountCdiRate(parsed.data.cdiBaseRate);
  } catch {
    return { error: "Erro ao salvar a taxa CDI." };
  }

  revalidatePath("/profile");
  revalidatePath("/investments");
  return {};
}

export async function updateNotificationPrefsAction(input: unknown): Promise<AccountActionState> {
  const parsed = updateNotificationPrefsSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  try {
    await accountService.updateNotificationPrefs(parsed.data);
  } catch {
    return { error: "Erro ao salvar preferências." };
  }

  revalidatePath("/profile");
  return {};
}
