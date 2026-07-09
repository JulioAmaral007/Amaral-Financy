"use client";

import { useState, useTransition } from "react";

import { updatePjDayAction } from "@/actions/pj.actions";
import { Badge } from "@/components/ui/badge";
import { ToggleCheck } from "@/components/ui/toggle-check";
import { cn, formatHoursClock, formatTimeDigits, normalizeTimeDigits, timeDigitsToValue } from "@/lib/utils";
import { hasTwoShifts, hoursWorkedFromTimes } from "@/services/pj-math.service";
import type { PjDayView } from "@/services/pj.service";
import type { PjJourneyMode } from "@/types/pj";

interface PjDayRowProps {
  day: PjDayView;
  journeyMode: PjJourneyMode;
  onChanged: () => void;
}

interface TimeFieldProps {
  digits: string;
  placeholder: string;
  onChange: (digits: string) => void;
  onBlur: () => void;
  "aria-label": string;
}

/** Masked HH:mm text field — avoids the native time input's locale-dependent AM/PM ambiguity. */
function TimeField({ digits, placeholder, onChange, onBlur, ...props }: TimeFieldProps) {
  return (
    <input
      value={formatTimeDigits(digits)}
      onChange={(event) => onChange(normalizeTimeDigits(event.target.value))}
      onBlur={onBlur}
      placeholder={placeholder}
      inputMode="numeric"
      className="w-[42px] border-b-2 border-dotted border-rule bg-transparent py-0.5 text-center text-[12px] font-bold text-ink outline-none focus:border-ink"
      {...props}
    />
  );
}

function toDigits(time: string | null): string {
  return time ? time.replace(":", "") : "";
}

export function PjDayRow({ day, journeyMode, onChanged }: PjDayRowProps) {
  const twoShifts = hasTwoShifts(journeyMode);
  const [morningStart, setMorningStart] = useState(toDigits(day.morningStart));
  const [morningEnd, setMorningEnd] = useState(toDigits(day.morningEnd));
  const [afternoonStart, setAfternoonStart] = useState(toDigits(day.afternoonStart));
  const [afternoonEnd, setAfternoonEnd] = useState(toDigits(day.afternoonEnd));
  const [note, setNote] = useState(day.note);
  const [, startTransition] = useTransition();

  const morningStartValue = timeDigitsToValue(morningStart);
  const morningEndValue = timeDigitsToValue(morningEnd);
  const afternoonStartValue = twoShifts ? timeDigitsToValue(afternoonStart) : null;
  const afternoonEndValue = twoShifts ? timeDigitsToValue(afternoonEnd) : null;

  const computedHours = hoursWorkedFromTimes({
    morningStart: morningStartValue,
    morningEnd: morningEndValue,
    afternoonStart: afternoonStartValue,
    afternoonEnd: afternoonEndValue,
  });

  function handleToggleDone() {
    const nextDone = !day.done;
    startTransition(async () => {
      await updatePjDayAction({ dayId: day.id, done: nextDone });
      onChanged();
    });
  }

  function handleTimesBlur() {
    startTransition(async () => {
      await updatePjDayAction({
        dayId: day.id,
        morningStart: morningStartValue,
        morningEnd: morningEndValue,
        afternoonStart: afternoonStartValue,
        afternoonEnd: afternoonEndValue,
      });
      onChanged();
    });
  }

  function handleNoteBlur() {
    startTransition(async () => {
      await updatePjDayAction({ dayId: day.id, note });
      onChanged();
    });
  }

  return (
    <div className={cn("border-b border-dashed border-rule-faint py-2", day.done && "bg-paper-dim")}>
      <div className="flex items-center">
        <ToggleCheck
          checked={day.done}
          onClick={handleToggleDone}
          aria-label={`Marcar ${day.dateLabel} como concluído`}
        />
        <div className="ml-1 w-[84px] flex-none">
          <span className="text-[13.5px] font-bold text-ink">{day.dateLabel}</span>
          <span className="text-[11px] uppercase tracking-[0.06em] text-ink-faint"> {day.weekdayLabel}</span>
        </div>
        <div className="w-[72px] flex-none text-center text-[13.5px] font-bold text-ink">
          {computedHours !== null ? formatHoursClock(computedHours) : "—"}
        </div>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          onBlur={handleNoteBlur}
          placeholder="............................."
          className="min-w-0 flex-1 bg-transparent px-1 py-0.5 text-[12.5px] italic text-ink-soft outline-none"
        />
        <div className="flex w-[90px] flex-none justify-end">
          {day.statusLabel && day.statusTone && <Badge tone={day.statusTone}>{day.statusLabel}</Badge>}
        </div>
      </div>
      <div className="ml-9 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase tracking-[0.08em] text-ink-faint">
            {twoShifts ? "Manhã" : "Expediente"}
          </span>
          <TimeField
            digits={morningStart}
            placeholder="08:00"
            onChange={setMorningStart}
            onBlur={handleTimesBlur}
            aria-label={`Início ${twoShifts ? "da manhã" : "do expediente"} de ${day.dateLabel}`}
          />
          <span className="text-ink-faint">–</span>
          <TimeField
            digits={morningEnd}
            placeholder={twoShifts ? "12:00" : "17:00"}
            onChange={setMorningEnd}
            onBlur={handleTimesBlur}
            aria-label={`Fim ${twoShifts ? "da manhã" : "do expediente"} de ${day.dateLabel}`}
          />
        </div>
        {twoShifts && (
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.08em] text-ink-faint">Tarde</span>
            <TimeField
              digits={afternoonStart}
              placeholder="13:00"
              onChange={setAfternoonStart}
              onBlur={handleTimesBlur}
              aria-label={`Início da tarde de ${day.dateLabel}`}
            />
            <span className="text-ink-faint">–</span>
            <TimeField
              digits={afternoonEnd}
              placeholder="17:00"
              onChange={setAfternoonEnd}
              onBlur={handleTimesBlur}
              aria-label={`Fim da tarde de ${day.dateLabel}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
