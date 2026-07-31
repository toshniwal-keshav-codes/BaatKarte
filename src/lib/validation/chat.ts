import { z } from "zod";

export const searchUserSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Search query is required"),
});
export type SearchUserValues = z.infer<typeof searchUserSchema>;

export const messageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(4000, "Message too long"),
});
export type MessageValues = z.infer<typeof messageSchema>;
