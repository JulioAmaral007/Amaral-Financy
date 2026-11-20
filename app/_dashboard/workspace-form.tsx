"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";

import {
  createWorkspaceAction,
  deleteWorkspaceAction,
  updateWorkspaceAction,
} from "@/actions/workspace.actions";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToggleCheck } from "@/components/ui/toggle-check";
import { PERSON_LABELS } from "@/lib/people";
import { workspaceSchema, type WorkspaceInput } from "@/schemas/workspace.schema";
import type { Workspace } from "@/types/workspace";

interface WorkspaceFormProps {
  /** Presente ao editar o perfil ativo; ausente ao criar um novo. */
  workspace?: Workspace;
  canDelete?: boolean;
  /** Chamado após salvar/remover; a barra recarrega a página para trocar os dados exibidos. */
  onDone: () => void;
  onCancel: () => void;
}

export function WorkspaceForm({ workspace, canDelete = false, onDone, onCancel }: WorkspaceFormProps) {
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  const { register, control, handleSubmit, formState } = useForm<WorkspaceInput>({
    resolver: zodResolver(workspaceSchema),
    // Perfis novos (pessoais) nascem sem a divisão; ela pode ser ligada aqui.
    defaultValues: { name: workspace?.name ?? "", splitEnabled: workspace?.splitEnabled ?? false },
  });

  function onSubmit(data: WorkspaceInput) {
    setError(undefined);
    startTransition(async () => {
      const result = workspace
        ? await updateWorkspaceAction(workspace.id, data)
        : await createWorkspaceAction(data);
      if (result.error) {
        setError(result.error);
        return;
      }
      onDone();
    });
  }

  function handleDelete() {
    if (!workspace) return;

    const confirmed = window.confirm(
      `Remover o perfil "${workspace.name}"? Os dados dele não são apagados e ele pode ser restaurado depois.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteWorkspaceAction(workspace.id);
      if (result.error) {
        setError(result.error);
        return;
      }
      onDone();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <FormField label="Nome" htmlFor="workspace-name" error={formState.errors.name?.message}>
        <Input id="workspace-name" placeholder="Ex.: Pessoal" autoFocus {...register("name")} />
      </FormField>

      <Controller
        control={control}
        name="splitEnabled"
        render={({ field }) => (
          <div className="flex items-start gap-3">
            <ToggleCheck
              checked={field.value}
              onClick={() => field.onChange(!field.value)}
              aria-label="Dividir a conta com outras pessoas"
            />
            <div>
              <p className="text-[14px] font-semibold text-ink">Dividir a conta com outras pessoas</p>
              <p className="text-[13px] text-muted">
                Mostra quanto cada um paga ({PERSON_LABELS.salary1}, {PERSON_LABELS.salary2} e{" "}
                {PERSON_LABELS.salary3}). Desligado, o perfil mostra só o total do mês.
              </p>
            </div>
          </div>
        )}
      />

      {error && <p className="text-[13px] text-bad">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-2">
        {workspace && canDelete ? (
          <Button type="button" variant="danger" size="sm" onClick={handleDelete} disabled={isPending}>
            Remover perfil
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : workspace ? "Salvar" : "Criar perfil"}
          </Button>
        </div>
      </div>
    </form>
  );
}
