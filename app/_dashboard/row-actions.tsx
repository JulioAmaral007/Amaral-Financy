import type { LucideIcon } from "lucide-react";

interface RowAction {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

interface RowActionsProps {
  actions: RowAction[];
  disabled?: boolean;
}

/**
 * Botões de editar/remover de uma linha. No desktop aparecem ao passar o mouse
 * (ou ao focar); no toque ficam sempre visíveis, mas discretos.
 */
export function RowActions({ actions, disabled }: RowActionsProps) {
  return (
    <div className="flex flex-none items-center transition-opacity [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
      {actions.map(({ icon: Icon, label, onClick }) => (
        <button
          key={label}
          type="button"
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          title={label}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-faint transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-50"
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
