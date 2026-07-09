"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { logoutAction } from "@/actions/auth.actions";
import { updateAccountNameAction } from "@/actions/account.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AccountProfile } from "@/types/account";

interface AccountCardProps {
  account: AccountProfile;
}

function getInitials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2);
  return initials.toUpperCase();
}

function formatMemberSince(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(iso));
}

export function AccountCard({ account }: AccountCardProps) {
  const [name, setName] = useState(account.name);
  const [isSavingName, startSavingName] = useTransition();
  const [isLoggingOut, startLogout] = useTransition();

  function handleNameBlur() {
    const trimmed = name.trim();
    if (!trimmed || trimmed === account.name) {
      setName(account.name);
      return;
    }
    startSavingName(async () => {
      const result = await updateAccountNameAction({ name: trimmed });
      if (result?.error) {
        toast.error(result.error);
        setName(account.name);
      }
    });
  }

  function handleLogout() {
    startLogout(async () => {
      await logoutAction();
    });
  }

  return (
    <div>
      <div className="mb-5 flex flex-col items-center text-center">
        <div className="mb-3.5 flex h-28 w-24 -rotate-2 items-center justify-center border-2 border-ink bg-paper p-1 font-display text-[26px] text-ink shadow-[0_6px_14px_-6px_oklch(30%_0.05_80/0.5)]">
          {getInitials(account.name, account.email)}
        </div>
        <div className="text-[16px] font-bold text-ink">{account.name || account.email}</div>
        <div className="text-[12.5px] text-ink-faint">{account.email}</div>
        <div className="mt-1.5 text-[11px] uppercase tracking-[0.08em] text-ink-faint">
          Membro desde {formatMemberSince(account.createdAt)}
        </div>
      </div>

      <div className="mb-[22px]">
        <label
          htmlFor="account-name"
          className="mb-0.5 block text-[11px] uppercase tracking-[0.2em] text-ink-soft"
        >
          Nome de exibição
        </label>
        <div className="relative">
          <Input
            id="account-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={handleNameBlur}
            disabled={isSavingName}
          />
          {isSavingName && (
            <Loader2 className="absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-faint" />
          )}
        </div>
      </div>

      <Button variant="danger" className="w-full" onClick={handleLogout} disabled={isLoggingOut}>
        {isLoggingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sair da conta"}
      </Button>
    </div>
  );
}
