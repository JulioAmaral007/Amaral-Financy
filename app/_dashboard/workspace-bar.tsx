"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { restoreWorkspaceAction, switchWorkspaceAction } from "@/actions/workspace.actions";
import { cn } from "@/lib/utils";
import { notifyLoadError } from "@/lib/load-error";
import * as workspaceService from "@/services/workspace.service";
import type { Workspace } from "@/types/workspace";

import { WorkspaceForm } from "./workspace-form";

interface WorkspaceData {
  workspaces: Workspace[];
  deleted: Workspace[];
  active: Workspace;
}

type Panel = "create" | "edit" | null;

const iconButtonClass =
  "flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-ink/5 hover:text-ink";

/**
 * Troca de perfil, no cabeçalho. Os dados de cada perfil ficam na conta (Supabase,
 * filtrados por `workspace_id`); trocar muda o perfil ativo e recarrega a página,
 * o que reinicia todas as seções (e descarta edições pendentes) de uma vez.
 */
export function WorkspaceBar() {
  const [data, setData] = useState<WorkspaceData | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  function load() {
    return Promise.all([
      workspaceService.getWorkspaces(),
      workspaceService.getDeletedWorkspaces(),
      workspaceService.getActiveWorkspace(),
    ]).then(([workspaces, deleted, active]) => ({ workspaces, deleted, active }));
  }

  useEffect(() => {
    let cancelled = false;
    load().then((result) => {
      if (!cancelled) setData(result);
    }, notifyLoadError);
    return () => {
      cancelled = true;
    };
  }, []);

  // Fecha o painel com Esc ou clicando fora dele.
  useEffect(() => {
    if (!panel) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setPanel(null);
    }
    function onPointer(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setPanel(null);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [panel]);

  if (!data) return null;

  const { workspaces, deleted, active } = data;

  function handleSwitch(id: string) {
    startTransition(async () => {
      const result = await switchWorkspaceAction(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      window.location.reload();
    });
  }

  function handleRestore(workspace: Workspace) {
    startTransition(async () => {
      await restoreWorkspaceAction(workspace.id);
      setData(await load());
      toast.success(`Perfil "${workspace.name}" restaurado.`);
    });
  }

  return (
    <div ref={rootRef} className="relative flex min-w-0 items-center gap-1">
      <div
        className="flex min-w-0 gap-0.5 overflow-x-auto rounded-full bg-ink/5 p-1 [scrollbar-width:none]"
        role="radiogroup"
        aria-label="Perfil"
      >
        {workspaces.map((workspace) => {
          const isActive = workspace.id === active.id;
          return (
            <button
              key={workspace.id}
              type="button"
              role="radio"
              aria-checked={isActive}
              disabled={isPending}
              onClick={() => !isActive && handleSwitch(workspace.id)}
              className={cn(
                "max-w-40 flex-none cursor-pointer truncate rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold transition-all disabled:opacity-60",
                isActive ? "bg-surface text-ink shadow-pill" : "text-muted hover:text-ink"
              )}
            >
              {workspace.name}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => setPanel((current) => (current === "edit" ? null : "edit"))}
        className={iconButtonClass}
        aria-label={`Editar o perfil ${active.name}`}
        aria-expanded={panel === "edit"}
        title="Editar perfil"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setPanel((current) => (current === "create" ? null : "create"))}
        className={iconButtonClass}
        aria-label="Novo perfil"
        aria-expanded={panel === "create"}
        title="Novo perfil"
      >
        <Plus className="h-4 w-4" />
      </button>

      {panel && (
        <div className="absolute right-0 top-full z-30 mt-2 w-[min(calc(100vw-2rem),380px)] rounded-[24px] bg-surface p-5 shadow-pop">
          <p className="mb-3 font-display text-[17px] font-bold text-ink">
            {panel === "create" ? "Novo perfil" : `Perfil ${active.name}`}
          </p>
          {panel === "create" ? (
            // Criar já torna o novo perfil o ativo; recarrega para exibir os dados (vazios) dele.
            <WorkspaceForm onDone={() => window.location.reload()} onCancel={() => setPanel(null)} />
          ) : (
            <>
              <WorkspaceForm
                key={active.id}
                workspace={active}
                canDelete={workspaces.length > 1}
                onDone={() => window.location.reload()}
                onCancel={() => setPanel(null)}
              />
              {deleted.length > 0 && (
                <div className="mt-4 border-t pt-4">
                  <p className="mb-2 text-[13px] text-muted">Perfis removidos</p>
                  <div className="flex flex-wrap gap-1.5">
                    {deleted.map((workspace) => (
                      <button
                        key={workspace.id}
                        type="button"
                        disabled={isPending}
                        onClick={() => handleRestore(workspace)}
                        className="cursor-pointer rounded-full px-3 py-1 text-[13px] font-semibold text-muted ring-1 ring-inset ring-line hover:text-ink hover:ring-ink/30 disabled:opacity-50"
                      >
                        Restaurar {workspace.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
