import type { BadgeTone } from "@/components/ui/badge";
import * as pjCycleDayRepository from "@/repositories/pj-cycle-day.repository";
import * as pjCycleRepository from "@/repositories/pj-cycle.repository";
import type { ConfigurePjCycleInput, UpdatePjDayInput } from "@/schemas/pj.schema";
import * as authService from "@/services/auth.service";
import {
  buildNextCycleConfig,
  diffCycleDays,
  generateDayDates,
  hoursWorkedFromTimes,
  journeyHoursOf,
  pjSummary,
  type PjSummary,
} from "@/services/pj-math.service";
import { parseISODateLocal } from "@/services/goal-math.service";
import type { PjCycle, PjCycleConfig, PjCycleDay } from "@/types/pj";

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

async function requireUserId(): Promise<string> {
  const user = await authService.getCurrentUser();
  if (!user) throw new Error("not authenticated");
  return user.id;
}

function formatDateLabel(iso: string): string {
  const date = parseISODateLocal(iso);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function decorateDay(day: PjCycleDay, journeyHours: number): PjDayView {
  const date = parseISODateLocal(day.date);
  let statusLabel = "";
  let statusTone: BadgeTone | null = null;

  if (day.done) {
    const worked = day.hoursWorked ?? journeyHours;
    if (worked > journeyHours) {
      statusLabel = "+ acima";
      statusTone = "primary";
    } else if (worked < journeyHours) {
      statusLabel = "− abaixo";
      statusTone = "amber";
    } else {
      statusLabel = "na meta";
      statusTone = "neutral";
    }
  }

  return {
    ...day,
    dateLabel: formatDateLabel(day.date),
    weekdayLabel: WEEKDAY_LABELS[date.getDay()],
    statusLabel,
    statusTone,
  };
}

export interface PjDayView extends PjCycleDay {
  dateLabel: string;
  weekdayLabel: string;
  statusLabel: string;
  statusTone: BadgeTone | null;
}

export interface ActiveCycleView {
  cycle: PjCycle;
  days: PjDayView[];
  summary: PjSummary;
}

export async function getActiveCycleView(): Promise<ActiveCycleView | null> {
  const userId = await requireUserId();
  const cycle = await pjCycleRepository.getActiveCycle(userId);
  if (!cycle) return null;

  const days = await pjCycleDayRepository.listDays(cycle.id);
  const journeyHours = journeyHoursOf(cycle);

  return {
    cycle,
    days: days.map((day) => decorateDay(day, journeyHours)),
    summary: pjSummary(cycle, days),
  };
}

export async function configureCycle(input: ConfigurePjCycleInput): Promise<void> {
  const userId = await requireUserId();
  const existing = await pjCycleRepository.getActiveCycle(userId);
  const config: PjCycleConfig = input;
  const targetDates = generateDayDates(config);

  if (!existing) {
    const cycle = await pjCycleRepository.createCycle(userId, config);
    await pjCycleDayRepository.insertDays(cycle.id, userId, targetDates);
    return;
  }

  const existingDays = await pjCycleDayRepository.listDays(existing.id);
  const { toInsert, toDeleteIds } = diffCycleDays(existingDays, targetDates);

  await pjCycleRepository.updateCycleConfig(userId, existing.id, config);
  await Promise.all([
    pjCycleDayRepository.insertDays(existing.id, userId, toInsert),
    pjCycleDayRepository.deleteDays(toDeleteIds),
  ]);
}

export async function updateDay(input: UpdatePjDayInput): Promise<void> {
  const userId = await requireUserId();

  const timesProvided =
    input.morningStart !== undefined ||
    input.morningEnd !== undefined ||
    input.afternoonStart !== undefined ||
    input.afternoonEnd !== undefined;

  const hoursWorked = timesProvided
    ? hoursWorkedFromTimes({
        morningStart: input.morningStart ?? null,
        morningEnd: input.morningEnd ?? null,
        afternoonStart: input.afternoonStart ?? null,
        afternoonEnd: input.afternoonEnd ?? null,
      })
    : input.hoursWorked;

  await pjCycleDayRepository.updateDay(userId, input.dayId, {
    done: input.done,
    hoursWorked,
    note: input.note,
    morningStart: input.morningStart,
    morningEnd: input.morningEnd,
    afternoonStart: input.afternoonStart,
    afternoonEnd: input.afternoonEnd,
  });
}

export async function closeCycle(): Promise<void> {
  const userId = await requireUserId();
  const cycle = await pjCycleRepository.getActiveCycle(userId);
  if (!cycle) return;

  const days = await pjCycleDayRepository.listDays(cycle.id);
  const summary = pjSummary(cycle, days);

  await pjCycleRepository.archiveCycle(userId, cycle.id, {
    predictedHours: summary.predictedHours,
    workedHours: summary.workedHours,
    predictedValue: summary.predictedValue,
    receivedValue: summary.updatedValue,
  });

  const nextConfig = buildNextCycleConfig(cycle);
  const nextCycle = await pjCycleRepository.createCycle(userId, nextConfig);
  await pjCycleDayRepository.insertDays(nextCycle.id, userId, generateDayDates(nextConfig));
}

export interface ArchivedCycleView {
  cycle: PjCycle;
  periodLabel: string;
}

function decorateArchivedCycle(cycle: PjCycle): ArchivedCycleView {
  const start = parseISODateLocal(cycle.startDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  const end = parseISODateLocal(cycle.endDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  return { cycle, periodLabel: `${start} – ${end}` };
}

export async function listArchivedCyclesView(): Promise<ArchivedCycleView[]> {
  const userId = await requireUserId();
  const cycles = await pjCycleRepository.listArchivedCycles(userId);
  return cycles.map(decorateArchivedCycle);
}

export async function getArchivedCycleDetail(id: string): Promise<ArchivedCycleView | null> {
  const userId = await requireUserId();
  const cycle = await pjCycleRepository.getCycleById(userId, id);
  if (!cycle || cycle.status !== "archived") return null;
  return decorateArchivedCycle(cycle);
}
