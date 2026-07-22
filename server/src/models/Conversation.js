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
  },
  { timestamps: true },
);

// Compound unique index — ensures only one conversation exists per pair of users
ConversationSchema.index({ participants: 1 });

export const Conversation = mongoose.model("Conversation", ConversationSchema);
