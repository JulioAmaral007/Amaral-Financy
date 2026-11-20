import { z } from "zod";

import { DEFAULT_WORKSPACE_ID } from "@/lib/local-storage/keys";

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
  installment: z
    .object({
      groupId: z.string(),
      number: z.number().int().min(1),
      total: z.number().int().min(1),
    })
    .optional(),
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

/** Tudo o que um perfil guarda no localStorage. */
const workspaceDataSchema = z.object({
  profile: profileSchema.nullable().default(null),
  fixedBills: z.array(storedFixedBillSchema).default([]),
  history: z.array(storedHistoryEntrySchema).default([]),
  spendings: z.array(storedSpendingSchema).default([]),
  months: z.record(monthKeySchema, storedMonthSettingsSchema).default({}),
});

/** O id vira parte de chave do localStorage: só uuid / "casa". */
const workspaceIdSchema = z.string().regex(/^[A-Za-z0-9-]{1,64}$/);

const backupWorkspaceSchema = z.object({
  id: workspaceIdSchema,
  name: z.string().min(1),
  splitEnabled: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt,
  data: workspaceDataSchema,
});

const backupV2Schema = z
  .object({
    app: z.literal("rumo"),
    version: z.literal(2),
    exportedAt: z.string(),
    activeWorkspaceId: workspaceIdSchema,
    workspaces: z.array(backupWorkspaceSchema).min(1),
  })
  .refine((backup) => backup.workspaces.some((workspace) => !workspace.deletedAt), {
    message: "O backup precisa ter pelo menos um perfil ativo.",
  });

/** Formato anterior aos perfis: um único conjunto de dados, que vira o perfil "Casa". */
const backupV1Schema = z
  .object({
    app: z.literal("rumo"),
    version: z.literal(1),
    exportedAt: z.string(),
    data: workspaceDataSchema,
  })
  .transform(
    (backup): z.output<typeof backupV2Schema> => ({
      app: "rumo",
      version: 2,
      exportedAt: backup.exportedAt,
      activeWorkspaceId: DEFAULT_WORKSPACE_ID,
      workspaces: [
        {
          id: DEFAULT_WORKSPACE_ID,
          name: "Casa",
          splitEnabled: true,
          createdAt: backup.exportedAt,
          updatedAt: backup.exportedAt,
          deletedAt: null,
          data: backup.data,
        },
      ],
    })
  );

/** Aceita backups novos (v2, com perfis) e antigos (v1); sempre entrega o formato v2. */
export const backupFileSchema = z.union([backupV2Schema, backupV1Schema]);

export type BackupFile = z.output<typeof backupV2Schema>;
export type BackupWorkspace = BackupFile["workspaces"][number];
export type BackupWorkspaceData = BackupWorkspace["data"];
