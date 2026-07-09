import type { BadgeTone } from "@/components/ui/badge";
import { formatCurrencyBRL, formatPercent } from "@/lib/utils";
import * as goalRepository from "@/repositories/goal.repository";
import type { CreateGoalInput } from "@/schemas/goal.schema";
import * as accountService from "@/services/account.service";
import * as authService from "@/services/auth.service";
import {
  GOAL_CATEGORY_META,
  GOAL_PRIORITY_META,
  getGoalsDashboardStats,
  goalTimeLabel,
  simulateGoal,
  type GoalSimulation,
  type GoalsDashboardStats,
} from "@/services/goal-math.service";
import type { Goal } from "@/types/goal";

export interface GoalView extends Goal {
  categoryLabel: string;
  categoryGlyph: string;
  categoryTone: BadgeTone;
  priorityLabel: string;
  priorityTone: BadgeTone;
  sim: GoalSimulation;
  timeLabel: string;
  targetValueFormatted: string;
  currentValueFormatted: string;
  progressPctLabel: string;
}

function decorateGoal(goal: Goal, cdiBaseRate: number, today: Date = new Date()): GoalView {
  const sim = simulateGoal(goal, cdiBaseRate, today);
  const categoryMeta = GOAL_CATEGORY_META[goal.category];
  const priorityMeta = GOAL_PRIORITY_META[goal.priority];

  return {
    ...goal,
    categoryLabel: categoryMeta.label,
    categoryGlyph: categoryMeta.glyph,
    categoryTone: categoryMeta.tone,
    priorityLabel: priorityMeta.label,
    priorityTone: priorityMeta.tone,
    sim,
    timeLabel: goalTimeLabel(sim),
    targetValueFormatted: formatCurrencyBRL(goal.targetValue),
    currentValueFormatted: formatCurrencyBRL(goal.currentValue),
    progressPctLabel: formatPercent(sim.progressPct),
  };
}

async function requireUserId(): Promise<string> {
  const user = await authService.getCurrentUser();
  if (!user) throw new Error("not authenticated");
  return user.id;
}

export interface GoalsViewData {
  goals: GoalView[];
  cdiBaseRate: number;
}

export async function getGoalsView(): Promise<GoalsViewData | null> {
  const user = await authService.getCurrentUser();
  if (!user) return null;

  const [goals, account] = await Promise.all([
    goalRepository.listGoals(user.id),
    accountService.getAccountProfile(),
  ]);

  const cdiBaseRate = account?.cdiBaseRate ?? 10.65;
  return { goals: goals.map((goal) => decorateGoal(goal, cdiBaseRate)), cdiBaseRate };
}

export async function getGoalDetailView(id: string): Promise<GoalView | null> {
  const data = await getGoalsView();
  if (!data) return null;
  return data.goals.find((goal) => goal.id === id) ?? null;
}

export async function getGoalsDashboardStatsForCurrentUser(): Promise<GoalsDashboardStats | null> {
  const data = await getGoalsView();
  if (!data) return null;
  return getGoalsDashboardStats(data.goals);
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const userId = await requireUserId();
  return goalRepository.createGoal(userId, input);
}

export async function updateGoal(id: string, input: CreateGoalInput): Promise<Goal> {
  const userId = await requireUserId();
  return goalRepository.updateGoal(userId, id, input);
}

export async function deleteGoal(id: string): Promise<void> {
  const userId = await requireUserId();
  return goalRepository.deleteGoal(userId, id);
}
