import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeTone = "primary" | "blue" | "purple" | "amber" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  primary: "bg-primary/14 text-primary-soft",
  blue: "bg-blue/14 text-blue-soft",
  purple: "bg-purple/14 text-purple-soft",
  amber: "bg-amber/14 text-amber-soft",
  danger: "bg-danger/14 text-danger-soft",
};

interface BadgeProps extends React.ComponentProps<"span"> {
  tone?: BadgeTone;
}

function Badge({ className, tone = "primary", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
