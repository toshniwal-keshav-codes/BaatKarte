import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email")
  .max(160);

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be 20 characters or fewer")
  .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscores");

export const nameSchema = z
  .string()
  .trim()
  .min(2, "Name is too short")
  .max(60, "Name is too long");

export const registerStartSchema = z.object({
  name: nameSchema,
  username: usernameSchema,
  email: emailSchema,
});

export const loginStartSchema = z.object({
  email: emailSchema,
});

export const otpVerifySchema = z.object({
  otpToken: z.string().min(10),
  code: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export const otpResendSchema = z.object({
  otpToken: z.string().min(10),
});