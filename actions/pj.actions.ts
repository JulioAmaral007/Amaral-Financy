"use server";

import { revalidatePath } from "next/cache";

import { configurePjCycleSchema, updatePjDaySchema } from "@/schemas/pj.schema";
import * as pjService from "@/services/pj.service";

export interface PjActionState {
  error?: string;
}

export async function configurePjCycleAction(input: unknown): Promise<PjActionState> {
  const parsed = configurePjCycleSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    await pjService.configureCycle(parsed.data);
  } catch {
    return { error: "Erro ao salvar o ciclo. Tente novamente." };
  }

  revalidatePath("/pj");
  return {};
}

export async function updatePjDayAction(input: unknown): Promise<PjActionState> {
  const parsed = updatePjDaySchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  try {
    await pjService.updateDay(parsed.data);
  } catch {
    return { error: "Erro ao salvar o dia." };
  }

  revalidatePath("/pj");
  return {};
}

export async function closePjCycleAction(): Promise<PjActionState> {
  try {
    await pjService.closeCycle();
  } catch {
    return { error: "Erro ao encerrar o ciclo." };
  }

  revalidatePath("/pj");
  return {};
}
