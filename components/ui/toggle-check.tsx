import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface ToggleCheckProps {
  checked: boolean;
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}

function ToggleCheck({ checked, onClick, disabled, ...props }: ToggleCheckProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={checked}
      className={cn(
        "flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] border text-primary-soft transition-colors disabled:opacity-50",
        checked ? "border-primary/50 bg-primary/18" : "border-border/15 bg-transparent"
      )}
      {...props}
    >
      {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </button>
  );
}

export { ToggleCheck };
