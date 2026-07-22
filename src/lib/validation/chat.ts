import { z } from "zod";

export const searchUserSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Enter a valid email"),
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
