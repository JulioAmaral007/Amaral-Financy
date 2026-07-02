import { z } from "zod";

export const updateProfileNameSchema = z.object({
  fullName: z.string().trim().min(1, "Informe um nome"),
});

export type UpdateProfileNameInput = z.infer<typeof updateProfileNameSchema>;
