import { assertNoError } from "@/lib/supabase/errors";
import * as accountRepository from "@/repositories/account.repository";
import * as authService from "@/services/auth.service";
import type { AccountProfile } from "@/types/account";

export async function getAccountProfile(): Promise<AccountProfile | null> {
  const user = await authService.getCurrentUser();
  if (!user) return null;

  const { data, error } = await accountRepository.getProfileRow(user.id);
  assertNoError(error, "getAccountProfile");
  return {
    id: user.id,
    email: user.email,
    name: data?.name ?? "",
    createdAt: data?.created_at ?? user.createdAt,
    cdiBaseRate: data?.cdi_base_rate ?? 10.65,
    notifications: {
      emailSummary: data?.notify_email ?? true,
      push: data?.notify_push ?? true,
      dueReminder: data?.notify_due ?? true,
    },
  };
}

export async function updateAccountName(name: string): Promise<void> {
  const user = await authService.getCurrentUser();
  if (!user) throw new Error("not authenticated");
  const { error } = await accountRepository.updateProfileName(user.id, name);
  assertNoError(error, "updateAccountName");
}

export async function updateNotificationPrefs(prefs: {
  emailSummary: boolean;
  push: boolean;
  dueReminder: boolean;
}): Promise<void> {
  const user = await authService.getCurrentUser();
  if (!user) throw new Error("not authenticated");
  const { error } = await accountRepository.updateNotificationPrefs(user.id, {
    notify_email: prefs.emailSummary,
    notify_push: prefs.push,
    notify_due: prefs.dueReminder,
  });
  assertNoError(error, "updateNotificationPrefs");
}

export async function updateAccountCdiRate(cdiBaseRate: number): Promise<void> {
  const user = await authService.getCurrentUser();
  if (!user) throw new Error("not authenticated");
  const { error } = await accountRepository.updateCdiBaseRate(user.id, cdiBaseRate);
  assertNoError(error, "updateAccountCdiRate");
}
