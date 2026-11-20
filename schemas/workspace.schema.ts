import { z } from "zod";

export const workspaceSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome do perfil").max(30, "Use até 30 caracteres"),
  splitEnabled: z.boolean(),
});

export type WorkspaceInput = z.infer<typeof workspaceSchema>;
