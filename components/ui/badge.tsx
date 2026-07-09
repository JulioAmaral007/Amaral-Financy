import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeTone = "primary" | "blue" | "purple" | "amber" | "danger" | "neutral";

/**
 * Badge renders as a rotated rubber-stamp tag (Rumo Recibo). The "neutral"
 * tone is the flat, faint ledger label with no border or rotation.
 */
const toneClasses: Record<BadgeTone, string> = {
  primary:
    "rounded-[4px] border-2 border-red text-red opacity-85 -rotate-3 px-2 py-0.5",
  blue: "rounded-[4px] border-2 border-blue text-blue opacity-85 -rotate-3 px-2 py-0.5",
  purple: "rounded-[4px] border-2 border-red text-red opacity-85 -rotate-3 px-2 py-0.5",
  amber:
    "rounded-[4px] border-2 border-ink-soft text-ink-soft opacity-85 -rotate-3 px-2 py-0.5",
  danger: "rounded-[4px] border-2 border-red text-red opacity-85 -rotate-3 px-2 py-0.5",
  neutral: "text-ink-faint",
};

interface BadgeProps extends React.ComponentProps<"span"> {
  tone?: BadgeTone;
}

function Badge({ className, tone = "primary", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center whitespace-nowrap text-[10.5px] font-bold uppercase tracking-[0.12em]",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
