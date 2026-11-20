"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Popover } from "@/components/ui/popover";
import { fieldTriggerClassName } from "@/components/ui/select";
import {
  MONTH_NAMES,
  MONTH_SHORT_LABELS,
  addDaysToDate,
  addMonthsToDate,
  daysInMonth,
  monthKeyFromDate,
  monthLabel,
  shiftMonth,
  todayDateValue,
  weekdayOfDate,
} from "@/lib/month";
import { cn } from "@/lib/utils";

const WEEKDAY_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"] as const;
const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
const WEEKDAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"] as const;

interface DatePickerProps {
  /** "YYYY-MM-DD" (ou vazio). */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Limites inclusivos, "YYYY-MM-DD". */
  min?: string;
  max?: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
  ref?: React.Ref<HTMLButtonElement>;
}

/** Ex.: "Sex, 20 nov". */
function formatTriggerDate(date: string): string {
  const [, month, day] = date.split("-").map(Number);
  return `${WEEKDAY_SHORT[weekdayOfDate(date)]}, ${day} ${MONTH_SHORT_LABELS[month - 1].toLowerCase()}`;
}

/** Ex.: "sexta, 20 de novembro de 2026" — para leitores de tela. */
function formatSpokenDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return `${WEEKDAY_NAMES[weekdayOfDate(date)]}, ${day} de ${MONTH_NAMES[month - 1].toLowerCase()} de ${year}`;
}

/**
 * Campo de data com calendário próprio (o seletor nativo muda de cara em cada
 * navegador e não segue o tema). Datas são sempre strings "YYYY-MM-DD".
 */
function DatePicker({
  value,
  onChange,
  onBlur,
  min,
  max,
  id,
  disabled,
  placeholder = "Escolha a data",
  className,
  ref,
  ...props
}: DatePickerProps) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const focusDayOnRender = React.useRef(false);
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState(() => monthKeyFromDate(value || todayDateValue()));
  const [focused, setFocused] = React.useState(value || todayDateValue());

  React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

  const today = todayDateValue();
  const inBounds = React.useCallback(
    (date: string) => (!min || date >= min) && (!max || date <= max),
    [min, max]
  );
  const clamp = React.useCallback(
    (date: string) => (min && date < min ? min : max && date > max ? max : date),
    [min, max]
  );

  // Teclado move o dia em foco: leva o foco do navegador junto.
  React.useEffect(() => {
    if (!open || !focusDayOnRender.current) return;
    focusDayOnRender.current = false;
    panelRef.current?.querySelector<HTMLElement>(`[data-date="${focused}"]`)?.focus();
  }, [open, focused, view]);

  function openCalendar() {
    const start = clamp(value || today);
    setFocused(start);
    setView(monthKeyFromDate(start));
    focusDayOnRender.current = true;
    setOpen(true);
  }

  function close(restoreFocus: boolean) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
    onBlur?.();
  }

  function choose(date: string) {
    if (!inBounds(date)) return;
    onChange(date);
    close(true);
  }

  function moveFocus(date: string) {
    const next = clamp(date);
    focusDayOnRender.current = true;
    setFocused(next);
    setView(monthKeyFromDate(next));
  }

  function changeView(delta: number) {
    // Mesmo dia no outro mês (ou o último dia dele) — `focused` está sempre no mês exibido.
    setView(shiftMonth(view, delta));
    setFocused(clamp(addMonthsToDate(focused, delta)));
  }

  function onDayKeyDown(event: React.KeyboardEvent, date: string) {
    const weekday = weekdayOfDate(date);
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDaysToDate(date, -1),
      ArrowRight: () => addDaysToDate(date, 1),
      ArrowUp: () => addDaysToDate(date, -7),
      ArrowDown: () => addDaysToDate(date, 7),
      Home: () => addDaysToDate(date, -weekday),
      End: () => addDaysToDate(date, 6 - weekday),
      PageUp: () => addMonthsToDate(date, -1),
      PageDown: () => addMonthsToDate(date, 1),
    };
    const move = moves[event.key];
    if (move) {
      event.preventDefault();
      moveFocus(move());
    }
  }

  // Tab saindo do painel: fecha e devolve ao campo, para o foco seguir no formulário.
  function onPanelKeyDown(event: React.KeyboardEvent) {
    if (event.key !== "Tab" || !panelRef.current) return;
    const focusables = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]):not([tabindex="-1"])')
    );
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if ((event.shiftKey && document.activeElement === first) || (!event.shiftKey && document.activeElement === last)) {
      close(true);
    }
  }

  const leadingBlanks = weekdayOfDate(`${view}-01`);
  const dayCount = daysInMonth(view);
  const days = Array.from({ length: dayCount }, (_, i) => `${view}-${String(i + 1).padStart(2, "0")}`);
  const canGoBack = !min || view > monthKeyFromDate(min);
  const canGoForward = !max || view < monthKeyFromDate(max);
  const yesterday = addDaysToDate(today, -1);
  const shortcuts = [
    { label: "Hoje", date: today },
    { label: "Ontem", date: yesterday },
  ].filter((shortcut) => inBounds(shortcut.date));

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => (open ? close(false) : openCalendar())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openCalendar();
          }
        }}
        className={cn(fieldTriggerClassName, "w-auto", className)}
        {...props}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-muted" />
        <span className={cn("min-w-0 flex-1 truncate whitespace-nowrap", !value && "text-faint")}>
          {value ? formatTriggerDate(value) : placeholder}
        </span>
      </button>

      <Popover anchorRef={triggerRef} open={open} onClose={close} className="w-[300px]">
        <div
          ref={panelRef}
          role="dialog"
          aria-label={props["aria-label"] ?? "Escolher data"}
          onKeyDown={onPanelKeyDown}
          className="overflow-y-auto p-3"
        >
          <div className="mb-1 flex items-center justify-between gap-2 pl-1.5">
            <p className="font-display text-[15.5px] font-bold tracking-[-0.01em] text-ink" aria-live="polite">
              {monthLabel(view)}
            </p>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => changeView(-1)}
                disabled={!canGoBack}
                aria-label="Mês anterior"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-ink disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => changeView(1)}
                disabled={!canGoForward}
                aria-label="Próximo mês"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-sunken hover:text-ink disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-y-0.5" role="group" aria-label={monthLabel(view)}>
            {WEEKDAY_INITIALS.map((initial, index) => (
              <span
                key={index}
                aria-hidden
                className="flex h-8 items-center justify-center text-[11.5px] font-semibold text-muted"
              >
                {initial}
              </span>
            ))}
            {Array.from({ length: leadingBlanks }, (_, index) => (
              <span key={`blank-${index}`} aria-hidden />
            ))}
            {days.map((date) => {
              const isSelected = date === value;
              const isToday = date === today;
              const enabled = inBounds(date);
              return (
                <button
                  key={date}
                  type="button"
                  data-date={date}
                  tabIndex={date === focused ? 0 : -1}
                  disabled={!enabled}
                  aria-pressed={isSelected}
                  aria-current={isToday ? "date" : undefined}
                  aria-label={formatSpokenDate(date)}
                  onClick={() => choose(date)}
                  onKeyDown={(event) => onDayKeyDown(event, date)}
                  className={cn(
                    "relative mx-auto flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-[14px] transition-colors",
                    isSelected
                      ? "bg-ink font-semibold text-on-ink"
                      : "text-ink hover:bg-sunken",
                    isToday && !isSelected && "font-bold",
                    !enabled && "cursor-default text-faint opacity-40 hover:bg-transparent"
                  )}
                >
                  {Number(date.slice(8, 10))}
                  {isToday && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute bottom-1 h-1 w-1 rounded-full",
                        isSelected ? "bg-on-ink" : "bg-thais"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {shortcuts.length > 0 && (
            <div className="mt-2 flex gap-1.5 border-t border-line pt-2.5">
              {shortcuts.map((shortcut) => (
                <button
                  key={shortcut.label}
                  type="button"
                  onClick={() => choose(shortcut.date)}
                  className={cn(
                    "h-8 cursor-pointer rounded-full px-3 text-[13px] font-semibold transition-colors",
                    value === shortcut.date
                      ? "bg-ink text-on-ink"
                      : "text-muted ring-1 ring-inset ring-line hover:text-ink hover:ring-ink/30"
                  )}
                >
                  {shortcut.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </Popover>
    </>
  );
}

export { DatePicker };
