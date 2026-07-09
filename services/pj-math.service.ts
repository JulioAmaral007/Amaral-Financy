import { round2 } from "@/lib/utils";
import { parseISODateLocal } from "@/lib/date";
import type { PjCycle, PjCycleConfig, PjCycleDay, PjJourneyMode } from "@/types/pj";

const DEFAULT_WEEKDAYS = [1, 2, 3, 4, 5];

function formatISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function journeyHoursOf(config: Pick<PjCycleConfig, "journeyMode" | "journeyCustomHours">): number {
  if (config.journeyMode === "h4") return 4;
  if (config.journeyMode === "h8") return 8;
  return config.journeyCustomHours || 8;
}

/** h8 splits the day into manhã/tarde shifts; h4 and custom use a single início/fim shift. */
export function hasTwoShifts(journeyMode: PjJourneyMode): boolean {
  return journeyMode === "h8";
}

function minutesOf(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function shiftHours(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const diff = minutesOf(end) - minutesOf(start);
  return diff > 0 ? diff / 60 : 0;
}

/** Derives hoursWorked from shift clock times; null when no complete shift was entered. */
export function hoursWorkedFromTimes(
  day: Pick<PjCycleDay, "morningStart" | "morningEnd" | "afternoonStart" | "afternoonEnd">
): number | null {
  const total = shiftHours(day.morningStart, day.morningEnd) + shiftHours(day.afternoonStart, day.afternoonEnd);
  return total > 0 ? round2(total) : null;
}

export function weekdaysOf(config: Pick<PjCycleConfig, "weekdayPreset" | "customWeekdays">): number[] {
  if (config.weekdayPreset === "segsex") return [1, 2, 3, 4, 5];
  if (config.weekdayPreset === "segsab") return [1, 2, 3, 4, 5, 6];
  return config.customWeekdays.length > 0 ? config.customWeekdays : DEFAULT_WEEKDAYS;
}

export function generateDayDates(config: PjCycleConfig): string[] {
  const weekdays = weekdaysOf(config);
  const start = parseISODateLocal(config.startDate);
  const end = parseISODateLocal(config.endDate);
  const dates: string[] = [];

  for (const cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    if (weekdays.includes(cursor.getDay())) dates.push(formatISODate(cursor));
  }

  return dates;
}

export interface CycleDaysDiff {
  toInsert: string[];
  toDeleteIds: string[];
  toKeep: PjCycleDay[];
}

/**
 * Reshape puro usado ao reconfigurar um ciclo: preserva os dias existentes
 * cuja data ainda está na nova faixa, remove os que ficaram fora, e informa
 * quais datas novas precisam de uma linha em branco.
 */
export function diffCycleDays(existing: PjCycleDay[], targetDates: string[]): CycleDaysDiff {
  const targetSet = new Set(targetDates);
  const existingByDate = new Map(existing.map((day) => [day.date, day]));

  const toInsert = targetDates.filter((date) => !existingByDate.has(date));
  const toDeleteIds = existing.filter((day) => !targetSet.has(day.date)).map((day) => day.id);
  const toKeep = existing.filter((day) => targetSet.has(day.date));

  return { toInsert, toDeleteIds, toKeep };
}

export interface PjSummary {
  journeyHours: number;
  total: number;
  doneCount: number;
  pendingCount: number;
  predictedHours: number;
  workedHours: number;
  pendingHours: number;
  updatedHours: number;
  predictedValue: number;
  updatedValue: number;
  guaranteedValue: number;
  projectedValue: number;
  diff: number;
  avgDaily: number;
  cyclePct: number;
  hoursPct: number;
}

export function pjSummary(cycle: PjCycleConfig, days: PjCycleDay[]): PjSummary {
  const journeyHours = journeyHoursOf(cycle);
  const rate = cycle.hourlyRate;

  const total = days.length;
  const doneDays = days.filter((day) => day.done);
  const pendingCount = total - doneDays.length;

  const predictedHours = total * journeyHours;
  const workedHours = doneDays.reduce((sum, day) => sum + (day.hoursWorked || journeyHours), 0);
  const pendingHours = pendingCount * journeyHours;
  const updatedHours = workedHours + pendingHours;

  const predictedValue = predictedHours * rate;
  const updatedValue = updatedHours * rate;
  const guaranteedValue = workedHours * rate;
  const projectedValue = pendingHours * rate;
  const diff = updatedValue - predictedValue;

  const avgDaily = doneDays.length > 0 ? workedHours / doneDays.length : 0;
  const cyclePct = total > 0 ? (doneDays.length / total) * 100 : 0;
  const hoursPct = predictedHours > 0 ? (workedHours / predictedHours) * 100 : 0;

  return {
    journeyHours,
    total,
    doneCount: doneDays.length,
    pendingCount,
    predictedHours,
    workedHours,
    pendingHours,
    updatedHours,
    predictedValue,
    updatedValue,
    guaranteedValue,
    projectedValue,
    diff,
    avgDaily,
    cyclePct,
    hoursPct,
  };
}

export function addDaysIso(iso: string, days: number): string {
  const date = parseISODateLocal(iso);
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}

export function daysBetweenIso(startIso: string, endIso: string): number {
  const start = parseISODateLocal(startIso);
  const end = parseISODateLocal(endIso);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/** Builds the next cycle's config right after `cycle` ends, same span, config carried over. */
export function buildNextCycleConfig(cycle: PjCycle): PjCycleConfig {
  const span = daysBetweenIso(cycle.startDate, cycle.endDate);
  const nextStart = addDaysIso(cycle.endDate, 1);
  const nextEnd = addDaysIso(nextStart, span);

  return {
    startDate: nextStart,
    endDate: nextEnd,
    hourlyRate: cycle.hourlyRate,
    journeyMode: "h8",
    journeyCustomHours: null,
    weekdayPreset: cycle.weekdayPreset,
    customWeekdays: cycle.customWeekdays,
  };
}
