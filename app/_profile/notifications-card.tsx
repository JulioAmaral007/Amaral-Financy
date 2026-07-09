"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateNotificationPrefsAction } from "@/actions/account.actions";
import { ToggleCheck } from "@/components/ui/toggle-check";
import type { AccountNotificationPrefs } from "@/types/account";

interface NotificationsCardProps {
  initialPrefs: AccountNotificationPrefs;
}

const ROWS: { key: keyof AccountNotificationPrefs; label: string }[] = [
  { key: "emailSummary", label: "Resumo por e-mail" },
  { key: "push", label: "Notificações push" },
  { key: "dueReminder", label: "Lembrete de vencimento" },
];

export function NotificationsCard({ initialPrefs }: NotificationsCardProps) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [, startTransition] = useTransition();

  function toggle(key: keyof AccountNotificationPrefs) {
    const previous = prefs;
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);

    startTransition(async () => {
      const result = await updateNotificationPrefsAction(next);
      if (result?.error) {
        toast.error(result.error);
        setPrefs(previous);
      }
    });
  }

  return (
    <section>
      <div className="mb-2.5 border-b-2 border-ink pb-1.5 text-[11.5px] font-bold uppercase tracking-[0.2em] text-ink-soft">
        Notificações
      </div>
      <div className="flex flex-col gap-2.5">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center justify-between">
            <span className="text-[14px] text-ink">{row.label}</span>
            <ToggleCheck checked={prefs[row.key]} onClick={() => toggle(row.key)} aria-label={row.label} />
          </div>
        ))}
      </div>
    </section>
  );
}
