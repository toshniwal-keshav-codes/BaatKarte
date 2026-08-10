import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { RefreshToken } from "../../models/RefreshToken.js";

const REFRESH_COOKIE = "bk_rt";

export function signAccessToken(user) {
  return jwt.sign({ sub: user._id.toString(), u: user.username }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_TTL,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

function hashToken(t) {
  return crypto.createHash("sha256").update(t).digest("hex");
}

function parseDurationMs(str) {
  const m = /^(\d+)([smhd])$/.exec(str);
  if (!m) return 30 * 24 * 3600 * 1000;
  const n = Number(m[1]);
  const unit = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2]];
  return n * unit;
}

export async function issueRefreshToken(user, meta = {}) {
  const raw = crypto.randomBytes(48).toString("base64url");
  const ttlMs = parseDurationMs(env.JWT_REFRESH_TTL);
  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(raw),
    userAgent: meta.userAgent,
    ip: meta.ip,
    expiresAt: new Date(Date.now() + ttlMs),
  });
  return { raw, ttlMs };
}

export async function rotateRefreshToken(rawToken, meta = {}) {
  const doc = await RefreshToken.findOne({ tokenHash: hashToken(rawToken) });
  if (!doc || doc.revokedAt || doc.expiresAt < new Date()) return null;
  doc.revokedAt = new Date();
  await doc.save();
  const raw = crypto.randomBytes(48).toString("base64url");
  const ttlMs = parseDurationMs(env.JWT_REFRESH_TTL);
  await RefreshToken.create({
    user: doc.user,
    tokenHash: hashToken(raw),
    userAgent: meta.userAgent,
    ip: meta.ip,
    expiresAt: new Date(Date.now() + ttlMs),
  });
  return { userId: doc.user, raw, ttlMs };
}

export async function revokeRefreshToken(rawToken) {
  if (!rawToken) return;
  await RefreshToken.updateOne(
    { tokenHash: hashToken(rawToken) },
    { $set: { revokedAt: new Date() } },
  );
}

export function setRefreshCookie(res, raw, ttlMs) {
  res.cookie(REFRESH_COOKIE, raw, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN || undefined,
    path: "/api/auth",
    maxAge: ttlMs,
  });
}

export function clearRefreshCookie(res) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.COOKIE_SECURE,
    sameSite: env.COOKIE_SAME_SITE,
    domain: env.COOKIE_DOMAIN || undefined,
    path: "/api/auth",
  });
}

export const REFRESH_COOKIE_NAME = REFRESH_COOKIE;