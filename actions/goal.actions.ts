"use server";

import { revalidatePath } from "next/cache";

import { createGoalSchema, deleteGoalSchema, updateGoalSchema } from "@/schemas/goal.schema";
import * as goalService from "@/services/goal.service";

export interface GoalActionState {
  error?: string;
}

export async function createGoalAction(input: unknown): Promise<GoalActionState> {
  const parsed = createGoalSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    await goalService.createGoal(parsed.data);
  } catch {
    return { error: "Erro ao salvar a meta. Tente novamente." };
  }

  revalidatePath("/goals");
  return {};
}

export async function updateGoalAction(input: unknown): Promise<GoalActionState> {
  const parsed = updateGoalSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    const { id, ...rest } = parsed.data;
    await goalService.updateGoal(id, rest);
  } catch {
    return { error: "Erro ao salvar a meta. Tente novamente." };
  }

  revalidatePath("/goals");
  return {};
}

export async function deleteGoalAction(input: unknown): Promise<GoalActionState> {
  const parsed = deleteGoalSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  try {
    await goalService.deleteGoal(parsed.data.id);
  } catch {
    return { error: "Erro ao excluir a meta. Tente novamente." };
  }

  revalidatePath("/goals");
  return {};
}
