"use server";

import { revalidatePath } from "next/cache";

import {
  createAssetSchema,
  createIncomeSchema,
  deleteAssetSchema,
  deleteIncomeSchema,
  updateAssetSchema,
  updateInvestmentSettingsSchema,
} from "@/schemas/investment.schema";
import * as investmentService from "@/services/investment.service";

export interface InvestmentActionState {
  error?: string;
}

const INVESTMENTS_PATH = "/investments";

export async function createAssetAction(input: unknown): Promise<InvestmentActionState> {
  const parsed = createAssetSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    await investmentService.createAsset(parsed.data);
  } catch {
    return { error: "Erro ao salvar o ativo. Verifique se o ticker já existe e tente novamente." };
  }

  revalidatePath(INVESTMENTS_PATH);
  return {};
}

export async function updateAssetAction(input: unknown): Promise<InvestmentActionState> {
  const parsed = updateAssetSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    const { id, ...rest } = parsed.data;
    await investmentService.updateAsset(id, rest);
  } catch {
    return { error: "Erro ao salvar o ativo. Tente novamente." };
  }

  revalidatePath(INVESTMENTS_PATH);
  return {};
}

export async function deleteAssetAction(input: unknown): Promise<InvestmentActionState> {
  const parsed = deleteAssetSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  try {
    await investmentService.deleteAsset(parsed.data.id);
  } catch {
    return { error: "Erro ao remover o ativo. Tente novamente." };
  }

  revalidatePath(INVESTMENTS_PATH);
  return {};
}

export async function updateInvestmentSettingsAction(input: unknown): Promise<InvestmentActionState> {
  const parsed = updateInvestmentSettingsSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    await investmentService.updateSettings(parsed.data);
  } catch {
    return { error: "Erro ao salvar as preferências. Tente novamente." };
  }

  revalidatePath(INVESTMENTS_PATH);
  return {};
}

export async function createIncomeAction(input: unknown): Promise<InvestmentActionState> {
  const parsed = createIncomeSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  try {
    await investmentService.createIncome(parsed.data);
  } catch {
    return { error: "Erro ao lançar o provento. Tente novamente." };
  }

  revalidatePath(INVESTMENTS_PATH);
  return {};
}

export async function deleteIncomeAction(input: unknown): Promise<InvestmentActionState> {
  const parsed = deleteIncomeSchema.safeParse(input);
  if (!parsed.success) return { error: "Dados inválidos." };

  try {
    await investmentService.deleteIncome(parsed.data.id);
  } catch {
    return { error: "Erro ao remover o provento. Tente novamente." };
  }

  revalidatePath(INVESTMENTS_PATH);
  return {};
}
