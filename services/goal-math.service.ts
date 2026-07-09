import type { BadgeTone } from "@/components/ui/badge";
import { formatCurrencyBRL, round2 } from "@/lib/utils";
import type { Goal, GoalCategory, GoalPriority } from "@/types/goal";
import type { GoalView } from "@/services/goal.service";

const SIMULATION_CAP_MONTHS = 480;

export const CHART_VIEW_WIDTH = 640;
export const CHART_VIEW_HEIGHT = 200;
export const CHART_Y_BASELINE = CHART_VIEW_HEIGHT - 30;

const CHART_X_RANGE = CHART_VIEW_WIDTH - 60;
const CHART_Y_RANGE = CHART_VIEW_HEIGHT - 60;
const CHART_X_START = 30;
const CHART_SAMPLE_COUNT = 10;

export interface GoalSimulationPoint {
  month: number;
  balance: number;
}

export interface GoalSimulation {
  annualRate: number;
  monthlyRate: number;
  totalContributedSoFar: number;
  yieldSoFar: number;
  path: GoalSimulationPoint[];
  monthsToGoal: number | null;
  reachable: boolean;
  completionDate: Date | null;
  progressPct: number;
  projectedFinalValue: number;
}

export interface ChartPoint {
  x: number;
  y: number;
}

/**
 * `goal.startDate` and PJ cycle dates are Postgres `date` columns (no TZ).
 * `new Date(isoString)` parses that as UTC midnight, which can shift the
 * calendar day depending on the local timezone — always go through this
 * instead for date-only strings.
 */
export function parseISODateLocal(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** Whole months elapsed from `a` to `b`, only counting a month once its day-of-month has passed. */
export function monthsBetween(a: Date, b: Date): number {
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months -= 1;
  return months;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function simulateGoal(goal: Goal, cdiBaseRate: number, today: Date = new Date()): GoalSimulation {
  const target = goal.targetValue;
  const current = goal.currentValue;
  const monthly = goal.monthlyContribution;
  const initial = goal.initialContribution;

  const annualRate =
    goal.rateMode === "cdi" ? (goal.cdiPercent / 100) * (cdiBaseRate / 100) : goal.fixedAnnualRate / 100;
  const monthlyRate = Math.pow(1 + Math.max(0, annualRate), 1 / 12) - 1;

  const start = goal.startDate ? parseISODateLocal(goal.startDate) : today;
  const monthsElapsed = Math.max(0, monthsBetween(start, today));
  const totalContributedSoFar = round2(initial + monthly * monthsElapsed);
  const yieldSoFar = round2(Math.max(0, current - totalContributedSoFar));

  let balance = round2(current);
  const path: GoalSimulationPoint[] = [{ month: 0, balance }];
  let monthsToGoal = target > 0 && balance >= target ? 0 : null;

  for (let month = 1; month <= SIMULATION_CAP_MONTHS && monthsToGoal === null; month++) {
    balance = round2(balance * (1 + monthlyRate) + monthly);
    path.push({ month, balance });
    if (target > 0 && balance >= target) monthsToGoal = month;
  }

  const reachable = monthsToGoal !== null;
  const completionDate = reachable ? addMonths(today, monthsToGoal as number) : null;
  const progressPct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const projectedFinalValue = reachable ? balance : path[path.length - 1].balance;

  return {
    annualRate,
    monthlyRate,
    totalContributedSoFar,
    yieldSoFar,
    path,
    monthsToGoal,
    reachable,
    completionDate,
    progressPct,
    projectedFinalValue,
  };
}

export function goalTimeLabel(sim: GoalSimulation): string {
  if (sim.progressPct >= 100) return "Meta atingida";
  if (!sim.reachable) return "Prazo muito longo";

  const months = sim.monthsToGoal as number;
  if (months === 0) return "Este mês";
  if (months < 12) return `${months} ${months === 1 ? "mês restante" : "meses restantes"}`;

  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const yearsLabel = `${years} ${years === 1 ? "ano" : "anos"}`;
  const remainderLabel = remainder > 0 ? ` e ${remainder} ${remainder === 1 ? "mês" : "meses"}` : "";
  return `${yearsLabel}${remainderLabel} restantes`;
}

export function buildChartPoints(path: GoalSimulationPoint[]): ChartPoint[] {
  if (path.length === 0) return [];

  const maxIdx = path.length - 1;
  const sampleCount = Math.min(CHART_SAMPLE_COUNT, path.length);
  const sampled = Array.from({ length: sampleCount }, (_, i) => {
    const idx = sampleCount === 1 ? 0 : Math.round((i * maxIdx) / (sampleCount - 1));
    return path[idx];
  });

  const maxVal = Math.max(...sampled.map((point) => point.balance)) * 1.15 || 1;
  const xStep = sampled.length > 1 ? CHART_X_RANGE / (sampled.length - 1) : 0;

  return sampled.map((point, i) => ({
    x: CHART_X_START + i * xStep,
    y: CHART_Y_BASELINE - (point.balance / maxVal) * CHART_Y_RANGE,
  }));
}

// ── Client-safe metadata & aggregation (no repository/I-O imports here on
// purpose — these are imported directly by "use client" components, and any
// server-only import in this file would break the client bundle). ──

export const GOAL_CATEGORY_META: Record<GoalCategory, { label: string; glyph: string; tone: BadgeTone }> = {
  reserva: { label: "Reserva de emergência", glyph: "R", tone: "amber" },
  casa: { label: "Casa", glyph: "H", tone: "primary" },
  carro: { label: "Carro", glyph: "C", tone: "blue" },
  viagem: { label: "Viagem", glyph: "V", tone: "purple" },
  aposentadoria: { label: "Aposentadoria", glyph: "A", tone: "primary" },
  computador: { label: "Computador", glyph: "PC", tone: "blue" },
  outro: { label: "Outro", glyph: "•", tone: "purple" },
};

export const GOAL_PRIORITY_META: Record<GoalPriority, { label: string; tone: BadgeTone }> = {
  alta: { label: "Alta", tone: "danger" },
  media: { label: "Média", tone: "amber" },
  baixa: { label: "Baixa", tone: "neutral" },
};

export interface GoalsDashboardStats {
  totalCurrentFormatted: string;
  totalProjectedFormatted: string;
  completedLabel: string;
  nextGoalLabel: string;
}

export function getGoalsDashboardStats(goals: GoalView[]): GoalsDashboardStats {
  const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentValue, 0);
  const totalProjected = goals.reduce((sum, goal) => sum + goal.sim.projectedFinalValue, 0);
  const completed = goals.filter((goal) => goal.sim.progressPct >= 100);
  const next = goals
    .filter((goal) => goal.sim.progressPct < 100 && goal.sim.reachable)
    .sort((a, b) => (a.sim.monthsToGoal ?? Infinity) - (b.sim.monthsToGoal ?? Infinity))[0];

  return {
    totalCurrentFormatted: formatCurrencyBRL(totalCurrent),
    totalProjectedFormatted: formatCurrencyBRL(totalProjected),
    completedLabel: `${completed.length} de ${goals.length}`,
    nextGoalLabel: next?.name ?? "—",
  };
}
