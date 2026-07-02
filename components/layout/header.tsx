"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/layout/logo";
import * as profileService from "@/services/profile.service";

export function Header() {
  const pathname = usePathname();
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    let cancelled = false;

    profileService.getProfile().then((profile) => {
      if (!cancelled) setInitials(profileService.getInitials(profile.fullName));
    });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-10 flex items-center gap-8 border-b border-border/10 bg-panel px-8 py-3">
      <Link href="/" className="flex flex-none items-center gap-2.5">
        <Logo size="xs" />
        <span className="text-[15px] font-bold tracking-tight text-foreground">
          Divisão<span className="text-primary">Split</span>
        </span>
      </Link>
      <div className="flex-1" />
      <Link
        href="/profile"
        className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-primary/35 bg-primary/20 text-[12.5px] font-bold text-primary-soft"
      >
        {initials}
      </Link>
    </header>
  );
}
