import * as React from "react";

import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "good" | "bad" | "ink";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-ink/5 text-muted",
  good: "bg-good/10 text-good",
  bad: "bg-bad/10 text-bad",
  ink: "bg-ink text-on-ink",
};

interface BadgeProps extends React.ComponentProps<"span"> {
  tone?: BadgeTone;
}

function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-semibold",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
