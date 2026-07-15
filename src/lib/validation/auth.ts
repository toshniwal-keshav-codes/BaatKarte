import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .email("Enter a valid email")
  .max(160);

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "At least 3 characters")
  .max(20, "20 characters max")
  .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, underscore only");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name is too short")
  .max(60, "Name is too long");

export const registerFormSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema,
});
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({ email: emailSchema });
export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const otpFormSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});
export type OtpFormValues = z.infer<typeof otpFormSchema>;