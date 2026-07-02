"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import { updateDisplayNameAction } from "@/actions/profile.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfileNameSchema, type UpdateProfileNameInput } from "@/schemas/profile.schema";

interface ProfileFormProps {
  initialName: string;
  initials: string;
}

export function ProfileForm({ initialName, initials }: ProfileFormProps) {
  const [displayName, setDisplayName] = useState(initialName);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, formState } = useForm<UpdateProfileNameInput>({
    resolver: zodResolver(updateProfileNameSchema),
    defaultValues: { fullName: initialName },
  });

  function onSubmit(data: UpdateProfileNameInput) {
    setError(undefined);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateDisplayNameAction(data);
      if (result.error) setError(result.error);
      if (result.success) {
        setSuccess(true);
        setDisplayName(data.fullName);
      }
    });
  }

  return (
    <div>
      <Link
        href="/"
        className="mb-5 inline-block text-[13.5px] font-semibold text-foreground/60 transition-colors hover:text-foreground"
      >
        ← Voltar
      </Link>

      <div className="max-w-[420px] rounded-2xl border border-border/7 bg-surface p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 flex-none items-center justify-center rounded-full bg-primary/16 text-[22px] font-bold text-primary-soft">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[17px] font-bold text-foreground">{displayName || "Usuário"}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            label="Nome de exibição"
            htmlFor="fullName"
            error={formState.errors.fullName?.message}
          >
            <Input id="fullName" {...register("fullName")} />
          </FormField>

          {error && <p className="text-[13px] text-danger-soft">{error}</p>}
          {success && <p className="text-[13px] text-primary-soft">Perfil atualizado com sucesso!</p>}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar alterações"}
          </Button>
        </form>
      </div>
    </div>
  );
}
