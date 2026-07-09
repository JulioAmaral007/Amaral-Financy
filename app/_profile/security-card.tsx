"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { changePasswordAction } from "@/actions/auth.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema, type ResetPasswordInput } from "@/schemas/auth.schema";

export function SecurityCard() {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  function openForm() {
    setError(undefined);
    reset({ password: "", confirmPassword: "" });
    setIsEditing(true);
  }

  function onSubmit(data: ResetPasswordInput) {
    setError(undefined);
    startTransition(async () => {
      const result = await changePasswordAction(data);
      if (result?.error) {
        setError(result.error);
        return;
      }
      toast.success("Senha alterada com sucesso.");
      setIsEditing(false);
    });
  }

  return (
    <section>
      <div className="mb-3 border-b-2 border-ink pb-1.5 text-[11.5px] font-bold uppercase tracking-[0.2em] text-ink-soft">
        Segurança
      </div>

      {!isEditing ? (
        <Button variant="outline" onClick={openForm} className="px-4 py-2.5 text-[12px]">
          Alterar senha
        </Button>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <FormField label="Nova senha" htmlFor="security-password" error={errors.password?.message}>
            <Input
              id="security-password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
          </FormField>

          <FormField
            label="Confirmar nova senha"
            htmlFor="security-confirm-password"
            error={errors.confirmPassword?.message}
          >
            <Input
              id="security-confirm-password"
              type="password"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          </FormField>

          {error && (
            <p className="border-2 border-dashed border-red px-3 py-2.5 text-[12.5px] text-red">!! {error}</p>
          )}

          <div className="flex justify-end gap-2.5">
            <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar nova senha"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
