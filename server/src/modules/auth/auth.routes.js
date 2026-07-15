import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  registerStart,
  loginStart,
  otpResend,
  otpVerify,
  refresh,
  logout,
  me,
  checkAvailability,
} from "./auth.controller.js";
import {
  registerStartSchema,
  loginStartSchema,
  otpResendSchema,
  otpVerifySchema,
} from "./auth.schemas.js";

const router = Router();

const startLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Try again shortly." },
});

const verifyLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification attempts." },
});

router.post("/register/start", startLimiter, validate(registerStartSchema), registerStart);
router.post("/login/start", startLimiter, validate(loginStartSchema), loginStart);
router.post("/otp/resend", startLimiter, validate(otpResendSchema), otpResend);
router.post("/otp/verify", verifyLimiter, validate(otpVerifySchema), otpVerify);

router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.get("/availability", checkAvailability);

export default router;