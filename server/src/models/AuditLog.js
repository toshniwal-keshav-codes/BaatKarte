import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["DELETE_USER", "DELETE_CONVERSATION", "DELETE_MESSAGES", "UPDATE_ROLE"],
      index: true,
    },
    targetType: {
      type: String,
      required: true,
      enum: ["User", "Conversation", "Message"],
    },
    targetId: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: -1,
    },
  },
  { timestamps: false },
);

export const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
