import * as React from "react";

import { cn } from "@/lib/utils";

/** Superfície branca padrão das seções do dashboard. */
function Card({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="card"
      className={cn(
        "scroll-mt-3 rounded-[28px] bg-surface p-5 shadow-card sm:p-6",
        className
      )}
      {...props}
    />
  );
}

/** Título de seção + linha de apoio opcional, à esquerda; ações à direita. */
function CardHeader({
  title,
  subtitle,
  children,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-start justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="font-display text-[20px] font-bold tracking-[-0.02em] text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-none items-center gap-2">{children}</div>}
    </div>
  );
}

export { Card, CardHeader };
