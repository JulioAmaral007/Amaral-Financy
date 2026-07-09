import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * PaperCard — a warm receipt sheet with drop shadow and a torn/perforated
 * bottom edge. This is the core surface of the Rumo Recibo design.
 */
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("paper-card px-5 pt-7 pb-6 sm:px-9 sm:pt-9 sm:pb-8", className)}
      {...props}
    />
  );
}

export { Card };
