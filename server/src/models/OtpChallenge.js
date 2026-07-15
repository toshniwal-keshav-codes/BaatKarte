import mongoose from "mongoose";
import crypto from "node:crypto";

const OtpSchema = new mongoose.Schema(
  {
    // "login" or "register"
    purpose: { type: String, enum: ["login", "register"], required: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    // For register we stash the pending profile here until verification.
    pendingProfile: {
      name: String,
      username: String,
    },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },
    consumedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// TTL cleanup: Mongo removes docs after expiresAt.
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

OtpSchema.statics.hashCode = function hashCode(code) {
  return crypto.createHash("sha256").update(String(code)).digest("hex");
};

export const OtpChallenge = mongoose.model("OtpChallenge", OtpSchema);