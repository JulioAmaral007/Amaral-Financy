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
      if (result?.error) {
        setError(result.error);
        return;
      }
      onSent(data.email);
    });
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-[19px] text-ink">Recuperar senha</h1>
      <p className="mb-4 text-[13px] leading-relaxed text-ink-soft">
        Enviaremos um link de redefinição para o seu e-mail.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField label="Email" htmlFor="forgot-email" error={errors.email?.message}>
          <Input id="forgot-email" type="email" autoComplete="email" {...register("email")} />
        </FormField>

        {error && (
          <p className="animate-fade-in border-2 border-dashed border-red px-3 py-2.5 text-[12.5px] text-red">
            !! {error}
          </p>
        )}

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar link"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onBack}
          className="cursor-pointer text-[12px] text-ink-faint underline decoration-dotted underline-offset-[3px] hover:text-ink"
        >
          &lt;- voltar para o login
        </button>
      </div>
    </div>
  );
}
