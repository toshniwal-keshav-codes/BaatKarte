import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  CLIENT_ORIGIN: z.string().default("http://localhost:8080"),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be >=16 chars"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be >=16 chars"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),

  COOKIE_DOMAIN: z.string().optional().default(""),
  COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((v) => v === "true"),

  OTP_TTL_SECONDS: z.coerce.number().default(600),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().default(60),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),

  BREVO_API_KEY: z.string().optional().default(""),
  BREVO_SENDER_EMAIL: z.string().email().default("noreply@example.com"),
  BREVO_SENDER_NAME: z.string().default("BaatKarte"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;