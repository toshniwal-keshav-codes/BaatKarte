import { User } from "../../models/User.js";
import { Conversation } from "../../models/Conversation.js";
import { Message } from "../../models/Message.js";
import { HttpError } from "../../middleware/error.js";
import { paginationSchema } from "./chat.schemas.js";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function populateConversation(query) {
  return query
    .populate("participants", "name username avatarUrl isOnline lastSeenAt")
    .populate({
      path: "lastMessage",
      select: "content sender sentAt status",
    });
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/chat/users/search?email=
 * Find a user by email (exclude self).
 */
export async function searchUser(req, res, next) {
  try {
    const email = (req.query.email || "").toLowerCase().trim();
    if (!email) return next(new HttpError(400, "Email is required", "missing_email"));

    const user = await User.findOne({ email }).select(
      "name username avatarUrl isOnline lastSeenAt email",
    );
    if (!user) return next(new HttpError(404, "User not found", "user_not_found"));
    if (user._id.toString() === req.user._id.toString())
      return next(new HttpError(400, "You cannot chat with yourself", "self_chat"));

    res.json({ user: user.toPublic() });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/conversations
 * Body: { email }
 * Opens existing conversation or creates a new one.
 */
export async function createOrOpenConversation(req, res, next) {
  try {
    const { email } = req.body;

    const other = await User.findOne({ email: email.toLowerCase() });
    if (!other) return next(new HttpError(404, "User not found", "user_not_found"));
    if (other._id.toString() === req.user._id.toString())
      return next(new HttpError(400, "You cannot chat with yourself", "self_chat"));

    const myId = req.user._id;
    const otherId = other._id;

    // Find existing DM conversation between exactly these two participants
    let conversation = await Conversation.findOne({
      participants: { $all: [myId, otherId], $size: 2 },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [myId, otherId],
      });
    }

    const populated = await populateConversation(
      Conversation.findById(conversation._id),
    );

    res.status(conversation.isNew ? 201 : 200).json({ conversation: populated });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/conversations
 * List all conversations for the current user, sorted by lastMessageAt desc.
 */
export async function getConversations(req, res, next) {
  try {
    const conversations = await populateConversation(
      Conversation.find({ participants: req.user._id }).sort({
        lastMessageAt: -1,
        createdAt: -1,
      }),
    );

    res.json({ conversations });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/conversations/:id/messages?cursor=&limit=
 * Cursor-based pagination — cursor is the sentAt of the oldest loaded message.
 */
export async function getMessages(req, res, next) {
  try {
    const { id: conversationId } = req.params;

    // Verify participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });
    if (!conversation)
      return next(new HttpError(404, "Conversation not found", "not_found"));

    const { cursor, limit } = paginationSchema.parse(req.query);

    const filter = { conversationId };
    if (cursor) {
      filter.sentAt = { $lt: new Date(cursor) };
    }

    const messages = await Message.find(filter)
      .sort({ sentAt: -1 })
      .limit(limit)
      .populate("sender", "name username avatarUrl");

    // Return oldest first so the UI can append correctly
    res.json({
      messages: messages.reverse(),
      hasMore: messages.length === limit,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/conversations/:id/messages
 * Body: { content }
 * Saves message, updates conversation.lastMessage, emits via Socket.io.
 */
export async function sendMessage(req, res, next) {
  try {
    const { id: conversationId } = req.params;
    const { content } = req.body;

    // Verify participant
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });
    if (!conversation)
      return next(new HttpError(404, "Conversation not found", "not_found"));

    const message = await Message.create({
      conversationId,
      sender: req.user._id,
      content,
    });

    // Update conversation metadata
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageAt: message.sentAt,
    });

    await message.populate("sender", "name username avatarUrl");

    // Emit real-time event via Socket.io (io attached to req.app)
    const io = req.app.get("io");
    if (io) {
      io.to(conversationId).emit("message:new", { message });
      io.to(conversationId).emit("conversation:updated", {
        conversationId,
        lastMessage: message,
        lastMessageAt: message.sentAt,
      });
    }

    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/chat/conversations/:id
 * Soft-deletes: removes user from participants. Deletes conversation if empty.
 */
export async function deleteConversation(req, res, next) {
  try {
    const { id: conversationId } = req.params;
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: req.user._id,
    });
    if (!conversation)
      return next(new HttpError(404, "Conversation not found", "not_found"));

    // Remove current user from participants
    conversation.participants = conversation.participants.filter(
      (p) => p.toString() !== req.user._id.toString(),
    );

    if (conversation.participants.length === 0) {
      // Both users left — delete conversation and its messages
      await Message.deleteMany({ conversationId });
      await conversation.deleteOne();
    } else {
      await conversation.save();
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
