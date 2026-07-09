import { assertNoError, unwrapList } from "@/lib/supabase/errors";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { CreateGoalInput } from "@/schemas/goal.schema";
import type { Goal } from "@/types/goal";

interface GoalRow {
  id: string;
  name: string;
  description: string;
  category: string;
  target_value: number;
  current_value: number;
  initial_contribution: number;
  monthly_contribution: number;
  start_date: string;
  rate_mode: string;
  cdi_percent: number;
  fixed_annual_rate: number;
  priority: string;
  created_at: string;
  updated_at: string;
}

const SELECT_COLUMNS =
  "id, name, description, category, target_value, current_value, initial_contribution, monthly_contribution, start_date, rate_mode, cdi_percent, fixed_annual_rate, priority, created_at, updated_at";

function mapRow(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category as Goal["category"],
    targetValue: row.target_value,
    currentValue: row.current_value,
    initialContribution: row.initial_contribution,
    monthlyContribution: row.monthly_contribution,
    startDate: row.start_date,
    rateMode: row.rate_mode as Goal["rateMode"],
    cdiPercent: row.cdi_percent,
    fixedAnnualRate: row.fixed_annual_rate,
    priority: row.priority as Goal["priority"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRowInput(input: CreateGoalInput) {
  return {
    name: input.name,
    description: input.description,
    category: input.category,
    target_value: input.targetValue,
    current_value: input.currentValue,
    initial_contribution: input.initialContribution,
    monthly_contribution: input.monthlyContribution,
    start_date: input.startDate,
    rate_mode: input.rateMode,
    cdi_percent: input.cdiPercent,
    fixed_annual_rate: input.fixedAnnualRate,
    priority: input.priority,
  };
}

export async function listGoals(userId: string): Promise<Goal[]> {
  const supabase = await createServerSupabaseClient();
  const result = await supabase
    .from("goals")
    .select(SELECT_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .returns<GoalRow[]>();

  return unwrapList(result, "listGoals").map(mapRow);
}

export async function createGoal(userId: string, input: CreateGoalInput): Promise<Goal> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("goals")
    .insert({ user_id: userId, ...toRowInput(input) })
    .select(SELECT_COLUMNS)
    .single<GoalRow>();

  if (error || !data) throw new Error(error?.message ?? "failed to create goal");
  return mapRow(data);
}

export async function updateGoal(userId: string, id: string, input: CreateGoalInput): Promise<Goal> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("goals")
    .update(toRowInput(input))
    .eq("id", id)
    .eq("user_id", userId)
    .select(SELECT_COLUMNS)
    .single<GoalRow>();

  if (error || !data) throw new Error(error?.message ?? "failed to update goal");
  return mapRow(data);
}

export async function deleteGoal(userId: string, id: string): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("goals").delete().eq("id", id).eq("user_id", userId);
  assertNoError(error, "deleteGoal");
}
