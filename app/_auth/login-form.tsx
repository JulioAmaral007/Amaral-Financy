"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { loginAction } from "@/actions/auth.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clearActiveWorkspaceId } from "@/lib/active-workspace";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";

import { AuthError, authLinkClass } from "./auth-error";

interface LoginFormProps {
  onForgot: () => void;
  initialError?: string;
}

export function LoginForm({ onForgot, initialError }: LoginFormProps) {
  const [error, setError] = useState<string | undefined>(initialError);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(data: LoginInput) {
    setError(undefined);
    startTransition(async () => {
      const result = await loginAction(data);
      if (result.error) {
        setError(result.error);
        return;
      }
      // Recarga completa: parte de um estado limpo, já com a sessão nos cookies.
      clearActiveWorkspaceId();
      window.location.assign("/");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Email" htmlFor="login-email" error={errors.email?.message}>
        <Input id="login-email" type="email" autoComplete="email" {...register("email")} />
      </FormField>

      <FormField label="Senha" htmlFor="login-password" error={errors.password?.message}>
        <Input id="login-password" type="password" autoComplete="current-password" {...register("password")} />
      </FormField>

      <div className="text-right">
        <button type="button" onClick={onForgot} className={authLinkClass}>
          Esqueceu a senha?
        </button>
      </div>

      {error && <AuthError>{error}</AuthError>}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
      </Button>
    </form>
  );
}
