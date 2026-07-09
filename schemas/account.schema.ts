import { z } from "zod";

export const updateAccountNameSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome."),
});

export type UpdateAccountNameInput = z.infer<typeof updateAccountNameSchema>;

export const updateNotificationPrefsSchema = z.object({
  emailSummary: z.boolean(),
  push: z.boolean(),
  dueReminder: z.boolean(),
});

export type UpdateNotificationPrefsInput = z.infer<typeof updateNotificationPrefsSchema>;

export const updateCdiRateSchema = z.object({
  cdiBaseRate: z.number().min(0, "Informe uma taxa válida").max(100, "Informe uma taxa válida"),
});

export type UpdateCdiRateInput = z.infer<typeof updateCdiRateSchema>;
