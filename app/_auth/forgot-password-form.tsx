"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { forgotPasswordAction } from "@/actions/auth.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/auth.schema";

import { AuthError, authLinkClass } from "./auth-error";

interface ForgotPasswordFormProps {
  onSent: (email: string) => void;
  onBack: () => void;
}

export function ForgotPasswordForm({ onSent, onBack }: ForgotPasswordFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  function onSubmit(data: ForgotPasswordInput) {
    setError(undefined);
    startTransition(async () => {
      const result = await forgotPasswordAction(data);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSent(data.email);
    });
  }

  return (
    <div>
      <h1 className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink">Recuperar senha</h1>
      <p className="mb-4 mt-1 text-[14px] text-muted">Enviamos um link para você criar uma nova senha.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <FormField label="Email" htmlFor="forgot-email" error={errors.email?.message}>
          <Input id="forgot-email" type="email" autoComplete="email" {...register("email")} />
        </FormField>

        {error && <AuthError>{error}</AuthError>}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar link"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button type="button" onClick={onBack} className={authLinkClass}>
          Voltar para o login
        </button>
      </div>
    </div>
  );
}
