import { cn } from "@/lib/utils";

interface ToggleCheckProps {
  checked: boolean;
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}

/** Ledger checkbox: a sharp ink square stamped with an "X" when marked. */
function ToggleCheck({ checked, onClick, disabled, ...props }: ToggleCheckProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={checked}
      className={cn(
        "flex h-6 w-6 shrink-0 items-center justify-center border-2 border-ink text-[12px] font-bold leading-none text-paper transition-colors disabled:opacity-50",
        checked ? "bg-ink" : "bg-transparent"
      )}
      {...props}
    >
      {checked ? "X" : ""}
    </button>
  );
}

export { ToggleCheck };
