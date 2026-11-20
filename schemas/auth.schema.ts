import { z } from "zod";

const passwordSchema = z.string().min(6, "A senha deve ter pelo menos 6 caracteres.");

export const loginSchema = z.object({
  email: z.string().trim().min(1, "Preencha email e senha."),
  password: z.string().min(1, "Preencha email e senha."),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    name: z.string().trim().min(1, "Informe seu nome."),
    email: z.string().trim().min(1, "Preencha email e senha.").email("Informe um email válido."),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Informe seu e-mail.").email("Informe um email válido."),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
