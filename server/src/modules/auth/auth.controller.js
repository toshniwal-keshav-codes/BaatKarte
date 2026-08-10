import { env } from "../../config/env.js";
import { HttpError } from "../../middleware/error.js";
import { User } from "../../models/User.js";
import { OtpChallenge } from "../../models/OtpChallenge.js";
import { generateOtpCode, signOtpToken, verifyOtpToken } from "../../utils/otp.js";
import { sendOtpEmail } from "../../services/email.service.js";
import {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
  REFRESH_COOKIE_NAME,
} from "./tokens.js";

const OTP_SECRET = () => env.JWT_ACCESS_SECRET + ":otp";

async function createChallenge({ purpose, email, pendingProfile }) {
  const code = generateOtpCode();
  const codeHash = OtpChallenge.hashCode(code);
  const expiresAt = new Date(Date.now() + env.OTP_TTL_SECONDS * 1000);
  const challenge = await OtpChallenge.create({
    purpose,
    email,
    pendingProfile,
    codeHash,
    expiresAt,
  });
  const otpToken = signOtpToken({ cid: challenge._id.toString(), email }, OTP_SECRET(), env.OTP_TTL_SECONDS);
  return { challenge, otpToken, code };
}

export async function registerStart(req, res, next) {
  try {
    const { name, username, email } = req.body;

    const [emailUser, usernameUser] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);
    if (emailUser) throw new HttpError(409, "Email is already registered", "email_taken");
    if (usernameUser) throw new HttpError(409, "Username is already taken", "username_taken");

    const { otpToken, code } = await createChallenge({
      purpose: "register",
      email,
      pendingProfile: { name, username },
    });

    try {
      await sendOtpEmail({ to: email, name, code, purpose: "register" });
    } catch (emailErr) {
      console.error("[registerStart] OTP Email dispatch failed:", emailErr.message);
      throw new HttpError(500, `Failed to send OTP email: ${emailErr.message}`, "email_delivery_failed");
    }

    res.json({ otpToken, email, resendCooldown: env.OTP_RESEND_COOLDOWN_SECONDS });
  } catch (err) {
    next(err);
  }
}

export async function loginStart(req, res, next) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new HttpError(404, "No account found for this email", "user_not_found");

    const { otpToken, code } = await createChallenge({ purpose: "login", email });

    try {
      await sendOtpEmail({ to: email, name: user.name, code, purpose: "login" });
    } catch (emailErr) {
      console.error("[loginStart] OTP Email dispatch failed:", emailErr.message);
      throw new HttpError(500, `Failed to send OTP email: ${emailErr.message}`, "email_delivery_failed");
    }

    res.json({ otpToken, email, resendCooldown: env.OTP_RESEND_COOLDOWN_SECONDS });
  } catch (err) {
    next(err);
  }
}

export async function otpResend(req, res, next) {
  try {
    const payload = verifyOtpToken(req.body.otpToken, OTP_SECRET());
    if (!payload) throw new HttpError(400, "OTP session expired. Start again.", "otp_expired");

    const challenge = await OtpChallenge.findById(payload.cid);
    if (!challenge || challenge.consumedAt)
      throw new HttpError(400, "OTP session no longer valid.", "otp_invalid");

    const sinceLast = (Date.now() - new Date(challenge.lastSentAt).getTime()) / 1000;
    if (sinceLast < env.OTP_RESEND_COOLDOWN_SECONDS) {
      throw new HttpError(
        429,
        `Please wait ${Math.ceil(env.OTP_RESEND_COOLDOWN_SECONDS - sinceLast)}s before resending`,
        "resend_cooldown",
      );
    }

    const code = generateOtpCode();
    challenge.codeHash = OtpChallenge.hashCode(code);
    challenge.attempts = 0;
    challenge.lastSentAt = new Date();
    challenge.expiresAt = new Date(Date.now() + env.OTP_TTL_SECONDS * 1000);
    await challenge.save();

    try {
      await sendOtpEmail({
        to: challenge.email,
        name: challenge.pendingProfile?.name,
        code,
        purpose: challenge.purpose,
      });
    } catch (emailErr) {
      console.error("[otpResend] OTP Email dispatch failed:", emailErr.message);
      throw new HttpError(500, `Failed to resend OTP email: ${emailErr.message}`, "email_delivery_failed");
    }

    res.json({ ok: true, resendCooldown: env.OTP_RESEND_COOLDOWN_SECONDS });
  } catch (err) {
    next(err);
  }
}

export async function otpVerify(req, res, next) {
  try {
    const { otpToken, code } = req.body;
    const payload = verifyOtpToken(otpToken, OTP_SECRET());
    if (!payload) throw new HttpError(400, "OTP session expired. Start again.", "otp_expired");

    const challenge = await OtpChallenge.findById(payload.cid);
    if (!challenge || challenge.consumedAt)
      throw new HttpError(400, "OTP session no longer valid.", "otp_invalid");
    if (challenge.expiresAt < new Date())
      throw new HttpError(400, "OTP has expired. Request a new one.", "otp_expired");
    if (challenge.attempts >= env.OTP_MAX_ATTEMPTS)
      throw new HttpError(429, "Too many attempts. Request a new code.", "otp_locked");

    const supplied = OtpChallenge.hashCode(code);
    if (supplied !== challenge.codeHash) {
      challenge.attempts += 1;
      await challenge.save();
      throw new HttpError(400, "Incorrect code. Try again.", "otp_wrong");
    }

    challenge.consumedAt = new Date();
    await challenge.save();

    let user;
    if (challenge.purpose === "register") {
      const { name, username } = challenge.pendingProfile || {};
      // Re-check uniqueness at commit time.
      const conflict = await User.findOne({
        $or: [{ email: challenge.email }, { username }],
      });
      if (conflict) throw new HttpError(409, "Email or username was taken while you verified.", "conflict");
      user = await User.create({ name, username, email: challenge.email });
    } else {
      user = await User.findOne({ email: challenge.email });
      if (!user) throw new HttpError(404, "Account no longer exists", "user_not_found");
    }

    const accessToken = signAccessToken(user);
    const { raw, ttlMs } = await issueRefreshToken(user, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });
    setRefreshCookie(res, raw, ttlMs);

    res.json({ user: user.toPublic(), accessToken });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME];
    if (!raw) throw new HttpError(401, "No refresh token", "no_refresh");

    const rotated = await rotateRefreshToken(raw, {
      userAgent: req.headers["user-agent"],
      ip: req.ip,
    });
    if (!rotated) {
      clearRefreshCookie(res);
      throw new HttpError(401, "Refresh token invalid or expired", "bad_refresh");
    }

    const user = await User.findById(rotated.userId);
    if (!user) throw new HttpError(401, "User missing", "user_missing");

    setRefreshCookie(res, rotated.raw, rotated.ttlMs);
    const accessToken = signAccessToken(user);
    res.json({ user: user.toPublic(), accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res, next) {
  try {
    const raw = req.cookies?.[REFRESH_COOKIE_NAME];
    await revokeRefreshToken(raw);
    clearRefreshCookie(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ user: req.user.toPublic() });
}

export async function checkAvailability(req, res, next) {
  try {
    const { username, email } = req.query;
    const out = {};
    if (username) {
      const parsed = String(username).trim().toLowerCase();
      out.username = { value: parsed, available: !(await User.exists({ username: parsed })) };
    }
    if (email) {
      const parsed = String(email).trim().toLowerCase();
      out.email = { value: parsed, available: !(await User.exists({ email: parsed })) };
    }
    res.json(out);
  } catch (err) {
    next(err);
  }
}