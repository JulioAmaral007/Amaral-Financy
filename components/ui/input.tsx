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
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40 pointer-events-none" />
        )}
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40 text-sm font-mono pointer-events-none">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(
            "w-full min-w-0 rounded-lg border border-border/8 bg-input px-3.5 py-3 text-[15px] text-foreground placeholder:text-foreground/40 outline-none transition-colors focus:border-primary/40 disabled:pointer-events-none disabled:opacity-50",
            Icon && "pl-11",
            prefix && "pl-10",
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
