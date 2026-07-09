import * as React from "react";

import { cn } from "@/lib/utils";

/** A run of asterisks used as a receipt section divider. Clipped to width. */
function StarDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "overflow-hidden whitespace-nowrap text-[12px] tracking-[0.18em] text-ink-soft",
        className
      )}
    >
      {"* ".repeat(80)}
    </div>
  );
}

/** Big typewriter card title (Special Elite). */
function ReceiptTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("font-display text-[24px] tracking-[0.09em] text-ink", className)}
      {...props}
    />
  );
}

/** Small uppercase, letter-spaced ledger sub-heading. */
function SectionLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "text-[11.5px] font-bold uppercase tracking-[0.2em] text-ink-soft",
        className
      )}
      {...props}
    />
  );
}

/** A label…value row joined by a dotted leader. */
function LeaderRow({
  label,
  value,
  valueClassName,
  className,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-baseline py-1.5 text-[13.5px]", className)}>
      <span className="text-ink-soft">{label}</span>
      <span className="leader" />
      <span className={cn("font-bold text-ink", valueClassName)}>{value}</span>
    </div>
  );
}

/** Ink-outlined bar filled with a 45° hatch — the ledger progress meter. */
function HatchBar({ pct, className }: { pct: number; className?: string }) {
  const width = Math.min(100, Math.max(2, pct));
  return (
    <div className={cn("h-[13px] border-[1.5px] border-ink bg-paper", className)}>
      <div
        className="h-full"
        style={{
          width: `${width}%`,
          backgroundImage:
            "repeating-linear-gradient(45deg, var(--ink) 0 3px, transparent 3px 6px)",
        }}
      />
    </div>
  );
}

export { StarDivider, ReceiptTitle, SectionLabel, LeaderRow, HatchBar };
