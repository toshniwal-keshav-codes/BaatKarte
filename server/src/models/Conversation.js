import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    lastMessageAt: {
      type: Date,
      default: null,
      index: -1,
    },

    // --- Scalability & Modular Extension Fields ---
    type: {
      type: String,
      enum: ["direct", "group", "channel"],
      default: "direct",
    },
    title: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    pinnedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    archivedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    settings: {
      onlyAdminsCanPost: { type: Boolean, default: false },
      encryptionEnabled: { type: Boolean, default: false },
    },
    metadata: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

// Compound unique index — ensures only one conversation exists per pair of users
ConversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model("Conversation", ConversationSchema);
