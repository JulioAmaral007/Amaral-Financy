"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import { cn } from "@/lib/utils";
import type { AccountProfile } from "@/types/account";

interface HeaderProps {
  account: AccountProfile | null;
}

function getInitials(name: string, email: string): string {
  const source = name.trim() || email;
  const parts = source.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : source.slice(0, 2);
  return initials.toUpperCase();
}

const navItems = [
  { href: "/", label: "Início" },
  { href: "/investments", label: "Investimentos" },
  { href: "/pj", label: "PJ" },
];

export function Header({ account }: HeaderProps) {
  const pathname = usePathname();
  const today = new Date().toLocaleDateString("pt-BR");

  if (pathname === "/login") return null;

  return (
    <header className="paper-header sticky top-0 z-10 flex items-center gap-3 bg-paper px-4 py-4 shadow-[0_12px_26px_-20px_oklch(30%_0.05_80/0.8)] sm:gap-6 sm:px-10 sm:py-4">
      <Link href="/" className="flex min-w-0 flex-none items-center gap-2 sm:gap-3">
        <Logo size="sm" className="flex-none transition-transform hover:rotate-0" />
        <span className="font-display text-[17px] tracking-[0.1em] text-ink sm:text-[22px] sm:tracking-[0.12em]">
          RUMO
        </span>
        <span className="hidden text-[10px] uppercase tracking-[0.24em] text-ink-faint sm:inline">
          livro de contas
        </span>
      </Link>

      <span aria-hidden className="hidden h-6 w-px flex-none border-l-2 border-dotted border-rule-faint sm:block" />

      <nav className="flex min-w-0 items-center gap-3 sm:gap-6">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap text-[11px] uppercase tracking-[0.1em] transition-colors sm:text-[13px] sm:tracking-[0.16em]",
                active
                  ? "font-bold text-ink underline decoration-red decoration-wavy decoration-2 underline-offset-[6px]"
                  : "font-normal text-ink-soft hover:text-ink"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="min-w-0 flex-1" />

      <span className="hidden text-[11.5px] tracking-[0.12em] text-ink-faint sm:inline" suppressHydrationWarning>
        {today}
      </span>

      {account && (
        <Link
          href="/profile"
          aria-label="Perfil"
          className="flex h-[32px] w-[32px] flex-none -rotate-3 items-center justify-center rounded-full border-2 border-ink text-[11px] font-bold tracking-[0.05em] text-ink transition-transform hover:rotate-0 sm:h-[36px] sm:w-[36px] sm:text-[12px]"
        >
          {getInitials(account.name, account.email)}
        </Link>
      )}
    </header>
  );
}
