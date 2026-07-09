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
  { href: "/goals", label: "Metas" },
  { href: "/pj", label: "PJ" },
];

export function Header({ account }: HeaderProps) {
  const pathname = usePathname();
  const today = new Date().toLocaleDateString("pt-BR");

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-10 flex items-center gap-8 border-b-[2.5px] border-ink bg-paper px-6 py-3.5 shadow-[0_12px_26px_-20px_oklch(30%_0.05_80/0.8)] sm:px-10">
      <Link href="/" className="flex flex-none items-center gap-2.5">
        <Logo size="sm" className="transition-transform hover:rotate-0" />
        <span className="font-display text-[22px] tracking-[0.12em] text-ink">RUMO</span>
        <span className="hidden text-[10px] uppercase tracking-[0.24em] text-ink-faint sm:inline">
          livro de contas
        </span>
      </Link>

      <nav className="flex items-center gap-5 sm:gap-6">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-[13px] uppercase tracking-[0.16em] transition-colors",
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

      <div className="flex-1" />

      <span className="hidden text-[11.5px] tracking-[0.12em] text-ink-faint sm:inline" suppressHydrationWarning>
        {today}
      </span>

      {account && (
        <Link
          href="/profile"
          aria-label="Perfil"
          className="flex h-[34px] w-[34px] flex-none -rotate-3 items-center justify-center rounded-full border-2 border-ink text-[12px] font-bold tracking-[0.05em] text-ink transition-transform hover:rotate-0"
        >
          {getInitials(account.name, account.email)}
        </Link>
      )}
    </header>
  );
}
