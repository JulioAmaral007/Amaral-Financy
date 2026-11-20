import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function signInWithPassword(email: string, password: string) {
  const supabase = await createServerSupabaseClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signUp(email: string, password: string, name: string, emailRedirectTo: string) {
  const supabase = await createServerSupabaseClient();
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { name }, emailRedirectTo },
  });
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  return supabase.auth.signOut();
}

export async function resetPasswordForEmail(email: string, redirectTo: string) {
  const supabase = await createServerSupabaseClient();
  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

export async function updatePassword(password: string) {
  const supabase = await createServerSupabaseClient();
  return supabase.auth.updateUser({ password });
}

export async function getUser() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
}
