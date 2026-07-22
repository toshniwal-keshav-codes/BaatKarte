import { api } from "./client";

export interface PublicUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role?: "user" | "admin";
  avatarUrl?: string;
  bio?: string;
  isOnline?: boolean;
  lastSeenAt?: string;
  createdAt?: string;
}

export interface OtpChallengeResponse {
  otpToken: string;
  email: string;
  resendCooldown: number;
}

export interface AuthSession {
  user: PublicUser;
  accessToken: string;
}

export const authApi = {
  registerStart: (payload: { name: string; username: string; email: string }) =>
    api.post<OtpChallengeResponse>("/auth/register/start", payload).then((r) => r.data),

  loginStart: (payload: { email: string }) =>
    api.post<OtpChallengeResponse>("/auth/login/start", payload).then((r) => r.data),

  otpVerify: (payload: { otpToken: string; code: string }) =>
    api.post<AuthSession>("/auth/otp/verify", payload).then((r) => r.data),

  otpResend: (payload: { otpToken: string }) =>
    api.post<{ ok: true; resendCooldown: number }>("/auth/otp/resend", payload).then((r) => r.data),

  me: () => api.get<{ user: PublicUser }>("/auth/me").then((r) => r.data.user),

  logout: () => api.post("/auth/logout").then((r) => r.data),

  refresh: () => api.post<AuthSession>("/auth/refresh").then((r) => r.data),
};