"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";

import { Popover } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Aparência do campo fechado — a mesma do `Input`. Compartilhada com o `DatePicker`. */
export const fieldTriggerClassName =
  "flex h-11 w-full min-w-0 cursor-pointer items-center gap-2 rounded-2xl bg-sunken px-3.5 text-left text-[15px] text-ink outline-none ring-1 ring-inset ring-line transition-shadow hover:ring-ink/30 focus-visible:bg-surface focus-visible:ring-2 focus-visible:ring-ink disabled:pointer-events-none disabled:opacity-50 aria-expanded:bg-surface aria-expanded:ring-2 aria-expanded:ring-ink";

export interface SelectOption<T extends string | number> {
  value: T;
  label: string;
}

interface SelectProps<T extends string | number> {
  options: readonly SelectOption<T>[];
  value: T;
  onChange: (value: T) => void;
  onBlur?: () => void;
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

function Select<T extends string | number>({
  options,
  value,
  onChange,
  onBlur,
  id,
  name,
  disabled,
  className,
  ref,
  ...props
}: SelectProps<T>) {
  const generatedId = React.useId();
  const listId = `${id ?? generatedId}-list`;
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);
  const typeahead = React.useRef({ text: "", at: 0 });
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const selected = options[selectedIndex];

  React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

  // Ao abrir: foco na lista; a opção ativa sempre visível.
  React.useEffect(() => {
    if (!open) return;
    listRef.current?.focus({ preventScroll: true });
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  function openList() {
    setActiveIndex(selectedIndex);
    setOpen(true);
  }

  function close(restoreFocus: boolean) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
    onBlur?.();
  }

  function choose(index: number) {
    const option = options[index];
    if (option) onChange(option.value);
    close(true);
  }

  function onTriggerKeyDown(event: React.KeyboardEvent) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openList();
    }
  }

  function onListKeyDown(event: React.KeyboardEvent) {
    const last = options.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((index) => Math.min(last, index + 1));
        return;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((index) => Math.max(0, index - 1));
        return;
      case "Home":
        event.preventDefault();
        setActiveIndex(0);
        return;
      case "End":
        event.preventDefault();
        setActiveIndex(last);
        return;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(activeIndex);
        return;
      case "Tab":
        // Volta ao campo antes do Tab seguir, para o foco ir ao próximo campo do formulário.
        close(true);
        return;
    }

    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = event.timeStamp;
      const buffer = now - typeahead.current.at < 600 ? typeahead.current.text + event.key : event.key;
      typeahead.current = { text: buffer.toLowerCase(), at: now };
      const match = options.findIndex((option) =>
        option.label.toLowerCase().startsWith(typeahead.current.text)
      );
      if (match >= 0) setActiveIndex(match);
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        name={name}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={onTriggerKeyDown}
        className={cn(fieldTriggerClassName, className)}
        {...props}
      >
        <span className="min-w-0 flex-1 truncate">{selected?.label}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-muted transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <Popover anchorRef={triggerRef} open={open} onClose={close} matchWidth>
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={props["aria-label"]}
          aria-activedescendant={`${listId}-${activeIndex}`}
          onKeyDown={onListKeyDown}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 outline-none"
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            const isActive = index === activeIndex;
            return (
              <li
                key={String(option.value)}
                id={`${listId}-${index}`}
                data-index={index}
                role="option"
                aria-selected={isSelected}
                onPointerMove={() => setActiveIndex(index)}
                onClick={() => choose(index)}
                className={cn(
                  "flex h-10 cursor-pointer select-none items-center gap-3 rounded-xl px-3 text-[14.5px] transition-colors",
                  isActive ? "bg-sunken text-ink" : "text-muted",
                  isSelected && "font-semibold text-ink"
                )}
              >
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {isSelected && <Check className="h-4 w-4 shrink-0 animate-pop" strokeWidth={2.75} />}
              </li>
            );
          })}
        </ul>
      </Popover>
    </>
  );
}

export { Select };
