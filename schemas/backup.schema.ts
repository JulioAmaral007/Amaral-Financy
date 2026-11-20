import { z } from "zod";

import { fixedBillCategories, fixedBillPayers } from "./fixed-bill.schema";
import { budgetsSchema, monthKeySchema, splitModes } from "./month.schema";
import { spendingCategories } from "./spending.schema";

const deletedAt = z.string().nullable().default(null);

const storedFixedBillSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number(),
  category: z.enum(fixedBillCategories),
  payer: z.enum(fixedBillPayers),
  includedInBill: z.boolean(),
  month: monthKeySchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt,
});

const storedHistoryEntrySchema = z.object({
  id: z.string(),
  billAmount: z.number(),
  salary1Payment: z.number(),
  salary2Payment: z.number(),
  salary3Payment: z.number(),
  calculatedAt: z.string(),
  month: monthKeySchema.optional(),
  deletedAt,
});

const storedSpendingSchema = z.object({
  id: z.string(),
  category: z.enum(spendingCategories),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amount: z.number(),
  note: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt,
});

const storedMonthSettingsSchema = z.object({
  month: monthKeySchema,
  inss: z.number().min(0),
  extraPai: z.number().min(0),
  splitMode: z.enum(splitModes),
  budgets: budgetsSchema,
});

const profileSchema = z.object({
  salary1: z.number().min(0),
  salary2: z.number().min(0),
  salary3: z.number().min(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

/** Arquivo de backup: uma cópia de tudo que o app guarda no localStorage. */
export const backupFileSchema = z.object({
  app: z.literal("rumo"),
  version: z.literal(1),
  exportedAt: z.string(),
  data: z.object({
    profile: profileSchema.nullable().default(null),
    fixedBills: z.array(storedFixedBillSchema).default([]),
    history: z.array(storedHistoryEntrySchema).default([]),
    spendings: z.array(storedSpendingSchema).default([]),
    months: z.record(monthKeySchema, storedMonthSettingsSchema).default({}),
  }),
});

export type BackupFile = z.infer<typeof backupFileSchema>;
