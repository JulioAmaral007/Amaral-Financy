"use client";

import Link from "next/link";

import { Logo } from "@/components/layout/logo";

export function Header() {
  const today = new Date().toLocaleDateString("pt-BR");

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

      <div className="min-w-0 flex-1" />

      <span className="hidden text-[11.5px] tracking-[0.12em] text-ink-faint sm:inline" suppressHydrationWarning>
        {today}
      </span>
    </header>
  );
}
