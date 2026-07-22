import { z } from "zod";

export const adminQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional().default(""),
  role: z.enum(["all", "user", "admin"]).optional().default("all"),
});

export const updateRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

export const deleteMessagesSchema = z.object({
  conversationId: z.string().optional(),
  messageIds: z.array(z.string()).optional(),
});
