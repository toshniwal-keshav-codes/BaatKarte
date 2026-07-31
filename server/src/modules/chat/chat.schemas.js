import { z } from "zod";

export const createConversationSchema = z
  .object({
    email: z.string().trim().optional(),
    userId: z.string().optional(),
    username: z.string().trim().optional(),
  })
  .refine((data) => data.email || data.userId || data.username, {
    message: "Provide an email, username, or userId to start conversation",
  });

export const sendMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(4000, "Message is too long"),
});

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
});
