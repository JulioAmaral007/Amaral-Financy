import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

interface ToggleCheckProps {
  checked: boolean;
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}

/** Marcador redondo: preenchido quando ligado, com um pequeno "pop" ao marcar. */
function ToggleCheck({ checked, onClick, disabled, ...props }: ToggleCheckProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={checked}
      className={cn(
        "flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-ink text-on-ink" : "bg-surface ring-2 ring-inset ring-line hover:ring-ink/40"
      )}
      {...props}
    >
      {checked && <Check className="h-4 w-4 animate-pop" strokeWidth={3} />}
    </button>
  );
}

export { ToggleCheck };
