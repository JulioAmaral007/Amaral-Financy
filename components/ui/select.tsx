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
          "h-11 w-full min-w-0 cursor-pointer rounded-2xl bg-sunken px-3 text-[15px] text-ink outline-none ring-1 ring-inset ring-line focus:bg-surface focus:ring-2 focus:ring-ink disabled:pointer-events-none disabled:opacity-50",
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
