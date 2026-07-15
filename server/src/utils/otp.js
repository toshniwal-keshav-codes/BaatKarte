import crypto from "node:crypto";

export function generateOtpCode() {
  // 6-digit numeric, zero-padded, cryptographically random.
  const n = crypto.randomInt(0, 1_000_000);
  return n.toString().padStart(6, "0");
}

export function signOtpToken(payload, secret, ttlSeconds) {
  const header = { alg: "HS256", typ: "OTP" };
  const body = { ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds };
  const enc = (obj) => Buffer.from(JSON.stringify(obj)).toString("base64url");
  const data = `${enc(header)}.${enc(body)}`;
  const sig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyOtpToken(token, secret) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [h, b, s] = parts;
  const expected = crypto.createHmac("sha256", secret).update(`${h}.${b}`).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(s), Buffer.from(expected))) return null;
  const body = JSON.parse(Buffer.from(b, "base64url").toString("utf8"));
  if (body.exp && body.exp < Math.floor(Date.now() / 1000)) return null;
  return body;
}