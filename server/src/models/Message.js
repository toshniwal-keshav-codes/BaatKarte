import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: -1,
    },
    // TTL field — MongoDB will delete the document exactly 7 days after sentAt
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },

    // --- Scalability & Modular Extension Fields ---
    messageType: {
      type: String,
      enum: ["text", "voice", "file", "system"],
      default: "text",
    },
    attachments: [
      {
        url: { type: String },
        fileName: { type: String },
        mimeType: { type: String },
        fileSize: { type: Number },
        durationSeconds: { type: Number },
      },
    ],
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    encryption: {
      isEncrypted: { type: Boolean, default: false },
      keyVersion: { type: String },
      iv: { type: String },
    },
    moderation: {
      flagged: { type: Boolean, default: false },
      score: { type: Number, default: 0 },
      reason: { type: String, default: "" },
    },
  },
  { timestamps: false },
);

// TTL index: document is deleted when expiresAt is reached
MessageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for efficient cursor-based pagination
MessageSchema.index({ conversationId: 1, sentAt: -1 });

export const Message = mongoose.model("Message", MessageSchema);
