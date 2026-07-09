"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { loginAction } from "@/actions/auth.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginInput } from "@/schemas/auth.schema";

interface LoginFormProps {
  onForgot: () => void;
}

export function LoginForm({ onForgot }: LoginFormProps) {
  const [error, setError] = useState<string | undefined>();
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
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-[19px] text-ink">Entre para continuar</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <FormField label="Email" htmlFor="login-email" error={errors.email?.message}>
          <Input id="login-email" type="email" autoComplete="email" {...register("email")} />
        </FormField>

        <FormField label="Senha" htmlFor="login-password" error={errors.password?.message}>
          <Input id="login-password" type="password" autoComplete="current-password" {...register("password")} />
        </FormField>

        <div className="text-right">
          <button
            type="button"
            onClick={onForgot}
            className="cursor-pointer text-[12px] text-ink-faint underline decoration-dotted underline-offset-[3px] hover:text-ink"
          >
            esqueceu a senha?
          </button>
        </div>

        {error && (
          <p className="animate-fade-in border-2 border-dashed border-red px-3 py-2.5 text-[12.5px] text-red">
            !! {error}
          </p>
        )}

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
