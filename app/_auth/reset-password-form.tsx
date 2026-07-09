"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { resetPasswordAction } from "@/actions/auth.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema, type ResetPasswordInput } from "@/schemas/auth.schema";

interface ResetPasswordFormProps {
  onSuccess: () => void;
}

export function ResetPasswordForm({ onSuccess }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function onSubmit(data: ResetPasswordInput) {
    setError(undefined);
    startTransition(async () => {
      const result = await resetPasswordAction(data);
      if (result?.error) {
        setError(result.error);
        return;
      }
      onSuccess();
    });
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-[19px] text-ink">Definir nova senha</h1>
      <p className="mb-4 text-[13px] leading-relaxed text-ink-soft">
        Escolha uma nova senha para sua conta.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Nova senha" htmlFor="reset-password" error={errors.password?.message}>
          <Input id="reset-password" type="password" autoComplete="new-password" {...register("password")} />
        </FormField>

        <FormField
          label="Confirmar nova senha"
          htmlFor="reset-confirm-password"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="reset-confirm-password"
            type="password"
            autoComplete="new-password"
            {...register("confirmPassword")}
          />
        </FormField>

        {error && (
          <p className="animate-fade-in border-2 border-dashed border-red px-3 py-2.5 text-[12.5px] text-red">
            !! {error}
          </p>
        )}

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redefinir senha"}
        </Button>
      </form>
    </div>
  );
}
