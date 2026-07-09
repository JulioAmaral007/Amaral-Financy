import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-ink border-2 border-ink text-paper hover:bg-ink-soft hover:border-ink-soft",
  outline: "bg-transparent border-2 border-rule text-ink hover:bg-ink hover:border-ink hover:text-paper",
  ghost: "bg-transparent border-2 border-transparent text-ink-soft hover:text-ink",
  danger: "bg-transparent border-2 border-red text-red hover:bg-red hover:border-red hover:text-paper",
};

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonVariant;
}

function Button({ className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      data-variant={variant}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap px-4 py-3 text-[12.5px] font-bold uppercase tracking-[0.14em] transition-colors disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Button };
