import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  icon?: LucideIcon;
  prefix?: string;
  /** Classes do contêiner (o campo visível); `className` vai para o <input>. */
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, wrapperClassName, type, icon: Icon, prefix, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex h-11 items-center gap-2 rounded-2xl bg-sunken px-3.5 ring-1 ring-inset ring-line transition-shadow focus-within:bg-surface focus-within:ring-2 focus-within:ring-ink",
          wrapperClassName
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0 text-faint" />}
        {prefix && <span className="shrink-0 text-sm text-faint">{prefix}</span>}
        <input
          ref={ref}
          type={type}
          data-slot="input"
          className={cn(
            "w-full min-w-0 bg-transparent text-[15px] text-ink outline-none disabled:pointer-events-none disabled:opacity-50",
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
