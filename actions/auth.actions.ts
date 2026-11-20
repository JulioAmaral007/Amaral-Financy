"use server";

import { headers } from "next/headers";

import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/schemas/auth.schema";
import * as authService from "@/services/auth.service";

// Autenticação roda no servidor porque a sessão fica em cookies. O restante do app
// (dados) acessa o Supabase direto do navegador, com o mesmo cookie de sessão.

export interface AuthActionState {
  error?: string;
  needsEmailConfirmation?: boolean;
}

async function getOrigin(): Promise<string> {
  const requestHeaders = await headers();
  return `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${requestHeaders.get("host")}`;
}

export async function loginAction(input: unknown): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  return authService.signInWithPassword(parsed.data.email, parsed.data.password);
}

export async function signupAction(input: unknown): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const origin = await getOrigin();
  return authService.signUp(parsed.data.email, parsed.data.password, parsed.data.name, origin);
}

export async function forgotPasswordAction(input: unknown): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const origin = await getOrigin();
  return authService.requestPasswordReset(parsed.data.email, origin);
}

export async function resetPasswordAction(input: unknown): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  return authService.updatePassword(parsed.data.password);
}

export async function logoutAction(): Promise<void> {
  await authService.signOut();
}
