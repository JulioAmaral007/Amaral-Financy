"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from "@/schemas/auth.schema";
import * as authService from "@/services/auth.service";

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

  const result = await authService.signInWithPassword(parsed.data.email, parsed.data.password);
  if (result.error) return result;
  redirect("/");
}

export async function signupAction(input: unknown): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  const origin = await getOrigin();
  const result = await authService.signUp(parsed.data.email, parsed.data.password, parsed.data.name, origin);
  if (result.error) return result;
  if (!result.needsEmailConfirmation) redirect("/");
  return { needsEmailConfirmation: true };
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

export async function changePasswordAction(input: unknown): Promise<AuthActionState> {
  return resetPasswordAction(input);
}

export async function logoutAction(): Promise<void> {
  await authService.signOut();
  redirect("/login");
}
