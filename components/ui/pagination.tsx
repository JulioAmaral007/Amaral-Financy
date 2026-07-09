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
    <div className="mt-4 flex items-center justify-between text-[12px] uppercase tracking-[0.1em] text-ink-faint">
      <Link
        href={hrefForPage(prevPage)}
        aria-disabled={isFirst}
        className={cn("font-bold transition-colors", isFirst ? "pointer-events-none opacity-40" : "hover:text-ink")}
      >
        &lt;- Anterior
      </Link>
      <span>
        Página {page} de {totalPages}
      </span>
      <Link
        href={hrefForPage(nextPage)}
        aria-disabled={isLast}
        className={cn("font-bold transition-colors", isLast ? "pointer-events-none opacity-40" : "hover:text-ink")}
      >
        Próxima -&gt;
      </Link>
    </div>
  );
}
