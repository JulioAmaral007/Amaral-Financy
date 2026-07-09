import * as React from "react";

import { cn } from "@/lib/utils";

type SelectProps = React.ComponentProps<"select">;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        data-slot="select"
        className={cn(
          "w-full min-w-0 border-b-2 border-dotted border-rule bg-transparent px-0.5 py-2 text-[15px] text-ink outline-none [color-scheme:light] focus:border-ink disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = "Select";

export { Select };
