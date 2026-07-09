"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { signupAction } from "@/actions/auth.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupSchema, type SignupInput } from "@/schemas/auth.schema";

interface SignupFormProps {
  onNeedsConfirmation: (email: string) => void;
}

export function SignupForm({ onNeedsConfirmation }: SignupFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  function onSubmit(data: SignupInput) {
    setError(undefined);
    startTransition(async () => {
      const result = await signupAction(data);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.needsEmailConfirmation) onNeedsConfirmation(data.email);
    });
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-[19px] text-ink">Crie sua conta</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
        <FormField label="Nome" htmlFor="signup-name" error={errors.name?.message}>
          <Input id="signup-name" autoComplete="name" {...register("name")} />
        </FormField>

        <FormField label="Email" htmlFor="signup-email" error={errors.email?.message}>
          <Input id="signup-email" type="email" autoComplete="email" {...register("email")} />
        </FormField>

        <FormField label="Senha" htmlFor="signup-password" error={errors.password?.message}>
          <Input id="signup-password" type="password" autoComplete="new-password" {...register("password")} />
        </FormField>

        <FormField
          label="Confirmar senha"
          htmlFor="signup-confirm-password"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="signup-confirm-password"
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
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
        </Button>
      </form>
    </div>
  );
}
