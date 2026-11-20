"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { WorkspaceBar } from "@/app/_dashboard/workspace-bar";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";

export function Header() {
  const pathname = usePathname();

  // A tela de acesso tem a própria marca; sem conta logada também não há perfil nem usuário para mostrar.
  if (pathname === "/login") return null;

  return (
    <header className="flex items-center justify-between gap-3 py-3 sm:py-4">
      <Link href="/" className="flex flex-none items-center gap-2.5 rounded-lg">
        <Logo />
        <span className="hidden font-display text-[22px] font-bold tracking-[-0.03em] text-ink min-[400px]:inline">
          rumo
        </span>
      </Link>
      <div className="flex min-w-0 items-center gap-1">
        <WorkspaceBar />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
