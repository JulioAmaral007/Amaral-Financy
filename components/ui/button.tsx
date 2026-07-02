import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "bg-transparent border border-border/12 text-foreground hover:bg-white/5",
  ghost: "bg-transparent text-foreground/60 hover:text-foreground",
  danger: "bg-transparent border border-danger/35 text-danger-soft hover:bg-danger/10",
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
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors h-12 px-4 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Button };
