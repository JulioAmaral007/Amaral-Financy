import Link from "next/link";

import { WorkspaceBar } from "@/app/_dashboard/workspace-bar";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Header() {
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
      </div>
    </header>
  );
}
