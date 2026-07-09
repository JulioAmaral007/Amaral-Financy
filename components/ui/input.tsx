import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  icon?: LucideIcon;
  prefix?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon: Icon, prefix, ...props }, ref) => {
    return (
      <div className="flex items-baseline gap-2 border-b-2 border-dotted border-rule px-0.5 py-1 focus-within:border-ink">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-ink-faint" />}
        {prefix && (
          <span className="shrink-0 text-sm text-ink-faint">{prefix}</span>
        )}
        <input
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(
            "w-full min-w-0 bg-transparent py-1 text-[15px] text-ink placeholder:text-ink-faint/70 outline-none disabled:pointer-events-none disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
