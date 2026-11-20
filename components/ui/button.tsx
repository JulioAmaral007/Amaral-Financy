import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
type ButtonSize = "md" | "sm";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-ink text-on-ink hover:bg-ink/85 active:scale-[0.98]",
  outline: "bg-surface text-ink ring-1 ring-inset ring-line hover:ring-ink/30 active:scale-[0.98]",
  ghost: "bg-transparent text-muted hover:bg-ink/5 hover:text-ink",
  danger: "bg-transparent text-bad ring-1 ring-inset ring-bad/30 hover:bg-bad hover:text-on-ink",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-11 px-5 text-[14.5px]",
  sm: "h-9 px-3.5 text-[13.5px]",
};

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

function Button({ className, variant = "primary", size = "md", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      data-variant={variant}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
}

export { Button };
