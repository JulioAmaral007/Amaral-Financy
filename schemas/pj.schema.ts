import { z } from "zod";

export const pjJourneyModes = ["h4", "h8", "custom"] as const;

export const pjWeekdayPresets = ["segsex", "segsab", "custom"] as const;

export const configurePjCycleSchema = z
  .object({
    startDate: z.string().min(1, "Informe a data inicial"),
    endDate: z.string().min(1, "Informe a data final"),
    hourlyRate: z.number().positive("Informe um valor de hora válido"),
    journeyMode: z.enum(pjJourneyModes),
    journeyCustomHours: z.number().positive().nullable(),
    weekdayPreset: z.enum(pjWeekdayPresets),
    customWeekdays: z.array(z.number().int().min(0).max(6)),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "A data final deve ser depois da data inicial",
    path: ["endDate"],
  });

export type ConfigurePjCycleInput = z.infer<typeof configurePjCycleSchema>;

/**
 * Schema do formulário no cliente: valor da hora como string de centavos
 * (convenção do CurrencyInput), horas customizadas como texto livre.
 */
export const pjCycleConfigFormSchema = z.object({
  startDate: z.string().min(1, "Informe a data inicial"),
  endDate: z.string().min(1, "Informe a data final"),
  hourlyRate: z.string().min(1, "Informe o valor da hora"),
  journeyMode: z.enum(pjJourneyModes),
  journeyCustomHours: z.string(),
  weekdayPreset: z.enum(pjWeekdayPresets),
  customWeekdays: z.array(z.number().int().min(0).max(6)),
});

export type PjCycleConfigFormValues = z.infer<typeof pjCycleConfigFormSchema>;

const timeStringSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Horário inválido")
  .nullable();

export const updatePjDaySchema = z.object({
  dayId: z.string().min(1),
  done: z.boolean().optional(),
  hoursWorked: z.number().min(0).nullable().optional(),
  morningStart: timeStringSchema.optional(),
  morningEnd: timeStringSchema.optional(),
  afternoonStart: timeStringSchema.optional(),
  afternoonEnd: timeStringSchema.optional(),
});

export type UpdatePjDayInput = z.infer<typeof updatePjDaySchema>;
