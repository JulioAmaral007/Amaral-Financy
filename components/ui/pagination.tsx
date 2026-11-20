"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  paramName?: string;
}

const linkClass =
  "flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-ink/5";

export function Pagination({ page, totalPages, paramName = "page" }: PaginationProps) {
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  function hrefForPage(target: number): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set(paramName, String(target));
    return `?${params.toString()}`;
  }

  return (
    <div className="mt-4 flex items-center justify-center gap-3 text-[13px] text-muted">
      <Link
        href={hrefForPage(Math.max(1, page - 1))}
        scroll={false}
        aria-disabled={isFirst}
        aria-label="Página anterior"
        className={cn(linkClass, isFirst && "pointer-events-none opacity-30")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <span>
        {page} de {totalPages}
      </span>
      <Link
        href={hrefForPage(Math.min(totalPages, page + 1))}
        scroll={false}
        aria-disabled={isLast}
        aria-label="Próxima página"
        className={cn(linkClass, isLast && "pointer-events-none opacity-30")}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
