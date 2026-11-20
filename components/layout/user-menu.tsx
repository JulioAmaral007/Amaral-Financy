"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

import { logoutAction } from "@/actions/auth.actions";
import { clearActiveWorkspaceId } from "@/lib/active-workspace";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

interface CurrentUser {
  name: string;
  email: string;
}

function getInitials(user: CurrentUser): string {
  const source = user.name.trim() || user.email;
  const parts = source.split(/\s+/).filter(Boolean);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2);
  return initials.toUpperCase();
}

/** Avatar da conta no cabeçalho, com o e-mail e o botão de sair. */
export function UserMenu() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    // A sessão vem dos cookies, sem ida ao servidor; o proxy já garantiu que ela é válida.
    createBrowserSupabaseClient()
      .auth.getSession()
      .then(({ data }) => {
        const sessionUser = data.session?.user;
        if (cancelled || !sessionUser) return;
        const name = sessionUser.user_metadata?.name;
        setUser({ name: typeof name === "string" ? name : "", email: sessionUser.email ?? "" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fecha com Esc ou clicando fora.
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointer(event: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  if (!user) return null;

  function handleLogout() {
    startTransition(async () => {
      try {
        await logoutAction();
        clearActiveWorkspaceId();
        window.location.assign("/login");
      } catch {
        toast.error("Não foi possível sair. Tente de novo.");
      }
    });
  }

  return (
    <div ref={rootRef} className="relative flex-none">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Conta"
        aria-expanded={open}
        title={user.email}
        className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-ink text-[12px] font-bold text-on-ink transition-opacity hover:opacity-85"
      >
        {getInitials(user)}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-[min(calc(100vw-2rem),260px)] rounded-[24px] bg-surface p-4 shadow-pop">
          <p className="truncate font-display text-[16px] font-bold text-ink">{user.name || "Minha conta"}</p>
          <p className="truncate text-[13px] text-muted">{user.email}</p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="mt-3 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full text-[14px] font-semibold text-muted ring-1 ring-inset ring-line transition-colors hover:text-ink hover:ring-ink/30 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
