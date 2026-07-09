import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface ProfileRow {
  id: string;
  name: string;
  notify_email: boolean;
  notify_push: boolean;
  notify_due: boolean;
  cdi_base_rate: number;
  created_at: string;
}

export async function getProfileRow(userId: string) {
  const supabase = await createServerSupabaseClient();
  return supabase
    .from("profiles")
    .select("id, name, notify_email, notify_push, notify_due, cdi_base_rate, created_at")
    .eq("id", userId)
    .single<ProfileRow>();
}

export async function updateProfileName(userId: string, name: string) {
  const supabase = await createServerSupabaseClient();
  return supabase.from("profiles").update({ name }).eq("id", userId);
}

export async function updateNotificationPrefs(
  userId: string,
  prefs: { notify_email: boolean; notify_push: boolean; notify_due: boolean }
) {
  const supabase = await createServerSupabaseClient();
  return supabase.from("profiles").update(prefs).eq("id", userId);
}

export async function updateCdiBaseRate(userId: string, cdiBaseRate: number) {
  const supabase = await createServerSupabaseClient();
  return supabase.from("profiles").update({ cdi_base_rate: cdiBaseRate }).eq("id", userId);
}
