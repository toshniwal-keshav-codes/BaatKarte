import mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true, required: true },
    tokenHash: { type: String, required: true, unique: true },
    userAgent: String,
    ip: String,
    revokedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);