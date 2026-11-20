import * as authRepository from "@/repositories/auth.repository";

export interface AuthResult {
  error?: string;
}

function mapAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) return "Email ou senha incorretos.";
  if (normalized.includes("email not confirmed")) return "Confirme seu email antes de entrar.";
  if (normalized.includes("user already registered")) return "Este email já está cadastrado.";
  if (normalized.includes("password should be at least")) return "A senha deve ter pelo menos 6 caracteres.";
  if (normalized.includes("for security purposes")) return "Aguarde alguns instantes antes de tentar novamente.";
  return "Não foi possível concluir a operação. Tente novamente.";
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult> {
  const { error } = await authRepository.signInWithPassword(email, password);
  return error ? { error: mapAuthError(error.message) } : {};
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  origin: string
): Promise<AuthResult & { needsEmailConfirmation?: boolean }> {
  const emailRedirectTo = `${origin}/auth/callback`;
  const { data, error } = await authRepository.signUp(email, password, name, emailRedirectTo);
  if (error) return { error: mapAuthError(error.message) };
  return { needsEmailConfirmation: !data.session };
}

export async function signOut(): Promise<void> {
  await authRepository.signOut();
}

export async function requestPasswordReset(email: string, origin: string): Promise<AuthResult> {
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/login?step=reset")}`;
  const { error } = await authRepository.resetPasswordForEmail(email, redirectTo);
  // Always succeed regardless of whether the email exists, to avoid leaking account existence.
  if (error && normalizedIsRateLimit(error.message)) return { error: mapAuthError(error.message) };
  return {};
}

function normalizedIsRateLimit(message: string): boolean {
  return message.toLowerCase().includes("for security purposes");
}

export async function updatePassword(password: string): Promise<AuthResult> {
  const { error } = await authRepository.updatePassword(password);
  return error ? { error: mapAuthError(error.message) } : {};
}

export interface CurrentUser {
  id: string;
  email: string;
  createdAt: string;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const user = await authRepository.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? "", createdAt: user.created_at };
}
