"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

import { exportBackupAction, importBackupAction } from "@/actions/backup.actions";
import { Button } from "@/components/ui/button";
import { toDateInputValue } from "@/lib/month";

/**
 * Os dados ficam na conta (Supabase), então acompanham o login em qualquer aparelho.
 * O backup em arquivo é uma cópia de segurança extra e também o caminho para levar
 * para a conta os dados que ficaram no navegador (versão antiga, só localStorage).
 */
export function BackupSection() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  async function handleExport() {
    try {
      const json = await exportBackupAction();
      const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `rumo-backup-${toDateInputValue(new Date())}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Backup baixado.");
    } catch {
      toast.error("Não foi possível gerar o backup. Tente de novo.");
    }
  }

  async function handleFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const confirmed = window.confirm(
      "Importar este backup substitui TODOS os dados atuais da sua conta. Continuar?"
    );
    if (!confirmed) return;

    setIsImporting(true);
    try {
      const result = await importBackupAction(await file.text());
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Backup importado.");
      // Tudo mudou: recarregar é mais simples e seguro do que sincronizar cada seção.
      window.location.reload();
    } catch {
      toast.error("Não foi possível ler o arquivo. Confira se é um backup do Rumo.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <footer className="flex flex-col items-center gap-2 pt-1 text-center sm:flex-row sm:justify-between sm:text-left">
      <p className="text-[13px] text-muted">
        Seus dados ficam salvos na sua conta. Baixe um backup de vez em quando.
      </p>
      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" /> Baixar backup
        </Button>
        <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
          <Upload className="h-4 w-4" /> Importar
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChosen}
        />
      </div>
    </footer>
  );
}
