"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  paramName?: string;
}

export function Pagination({ page, totalPages, paramName = "page" }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(totalPages, page + 1);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  function hrefForPage(target: number): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, String(target));
    return `?${params.toString()}`;
  }

  return (
    <div className="mt-4 flex items-center justify-between text-[13px] text-foreground/55">
      <Link
        href={hrefForPage(prevPage)}
        aria-disabled={isFirst}
        className={cn("font-semibold transition-colors", isFirst ? "pointer-events-none opacity-40" : "hover:text-foreground")}
      >
        ← Anterior
      </Link>
      <span>
        Página {page} de {totalPages}
      </span>
      <Link
        href={hrefForPage(nextPage)}
        aria-disabled={isLast}
        className={cn("font-semibold transition-colors", isLast ? "pointer-events-none opacity-40" : "hover:text-foreground")}
      >
        Próxima →
      </Link>
    </div>
  );
}
