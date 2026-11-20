"use client";

import { useRef, useState } from "react";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

import { exportBackupAction, importBackupAction } from "@/actions/backup.actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReceiptTitle, StarDivider } from "@/components/ui/receipt";
import { toDateInputValue } from "@/lib/month";

/**
 * Os dados ficam só neste navegador (localStorage): limpar os dados do site ou
 * trocar de computador apaga tudo. O backup em arquivo é a proteção contra isso
 * e também o caminho para levar os dados da planilha para o sistema.
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
    } catch {
      toast.error("Erro ao gerar o backup. Tente novamente.");
    }
  }

  async function handleFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const confirmed = window.confirm(
      "Importar este backup substitui TODOS os dados atuais do sistema neste navegador. Deseja continuar?"
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
      toast.error("Erro ao ler o arquivo. Tente novamente.");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Card className="rotate-[0.2deg]">
      <ReceiptTitle className="tracking-[0.1em]">BACKUP</ReceiptTitle>
      <p className="mt-0.5 text-[12px] uppercase tracking-[0.1em] text-ink-faint">
        seus dados ficam só neste navegador
      </p>
      <StarDivider className="mb-3.5 mt-2.5" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" /> Exportar backup
        </Button>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isImporting}>
          <Upload className="h-4 w-4" /> Importar backup
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChosen}
        />
      </div>
    </Card>
  );
}
