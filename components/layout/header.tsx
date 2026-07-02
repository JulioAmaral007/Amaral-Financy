import Link from "next/link";

import { Logo } from "@/components/layout/logo";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-center border-b border-border/10 bg-panel px-4 py-3 sm:px-8">
      <Link href="/" className="flex items-center gap-2.5">
        <Logo size="xs" />
        <span className="text-[15px] font-bold tracking-tight text-foreground">
          Divisão<span className="text-primary">Split</span>
        </span>
      </Link>
    </header>
  );
}
