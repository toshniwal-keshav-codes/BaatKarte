import { User } from "../../models/User.js";
import { Conversation } from "../../models/Conversation.js";
import { Message } from "../../models/Message.js";
import { HttpError } from "../../middleware/error.js";
import { paginationSchema } from "./chat.schemas.js";

// ─── Safe Id Extraction & Serialization Helpers ─────────────────────────────

function safeId(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (val._id) return val._id.toString();
  if (val.id) return val.id.toString();
  if (typeof val.toString === "function") return val.toString();
  return String(val);
}

function serializeUser(u) {
  if (!u) return null;
  return {
    id: safeId(u),
    name: u.name || "",
    username: u.username || "",
    email: u.email || "",
    avatarUrl: u.avatarUrl || "",
    isOnline: Boolean(u.isOnline),
    lastSeenAt: u.lastSeenAt || null,
  };
}

function serializeMessage(m) {
  if (!m) return null;
  return {
    id: safeId(m),
    conversationId: safeId(m.conversationId),
    sender: typeof m.sender === "object" && m.sender ? serializeUser(m.sender) : { id: safeId(m.sender) },
    content: m.content || "",
    status: m.status || "sent",
    sentAt: m.sentAt || new Date(),
    expiresAt: m.expiresAt || null,
  };
}

function serializeConversation(c) {
  if (!c) return null;
  return {
    id: safeId(c),
    participants: Array.isArray(c.participants) ? c.participants.map(serializeUser).filter(Boolean) : [],
    lastMessage: c.lastMessage ? serializeMessage(c.lastMessage) : null,
    lastMessageAt: c.lastMessageAt || null,
    createdAt: c.createdAt || null,
    updatedAt: c.updatedAt || null,
  };
}

function populateConversation(query) {
  return query
    .populate("participants", "name username email avatarUrl isOnline lastSeenAt")
    .populate({
      path: "lastMessage",
      select: "conversationId content sender sentAt status",
    });
}

// ─── Controllers ─────────────────────────────────────────────────────────────

/**
 * GET /api/chat/users/search?q=
 * Find users by email, username, or partial string (excludes self).
 */
export async function searchUser(req, res, next) {
  try {
    const q = String(req.query.q || req.query.query || req.query.email || "").toLowerCase().trim();
    if (!q) return res.json({ users: [] });

    const searchRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const users = await User.find({
      _id: { $ne: req.user._id },
      $or: [{ email: searchRegex }, { username: searchRegex }, { name: searchRegex }],
    })
      .select("name username email avatarUrl isOnline lastSeenAt")
      .limit(20);

    res.json({ users: users.map(serializeUser).filter(Boolean) });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/chat/conversations
 * Body: { email, userId }
 * Opens existing conversation or creates a new one.
 */
export async function createOrOpenConversation(req, res, next) {
  try {
    const { email, userId } = req.body;
    let other = null;

    if (userId) {
      other = await User.findById(userId);
    } else if (email) {
      const trimmed = String(email).trim().toLowerCase();
      other = await User.findOne({
        $or: [{ email: trimmed }, { username: trimmed }],
      });
    }

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

    res.status(conversation.isNew ? 201 : 200).json({ conversation: serializeConversation(populated) });
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
    const rawConversations = await populateConversation(
      Conversation.find({ participants: req.user._id }).sort({
        lastMessageAt: -1,
        createdAt: -1,
      }),
    );

    const conversations = rawConversations.map(serializeConversation).filter(Boolean);

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
      .populate("sender", "name username email avatarUrl");

    const serializedMessages = messages.reverse().map(serializeMessage).filter(Boolean);

    res.json({
      messages: serializedMessages,
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

    await message.populate("sender", "name username email avatarUrl");

    const serializedMessage = serializeMessage(message);

    // Emit real-time event via Socket.io (io attached to req.app)
    const io = req.app.get("io");
    if (io) {
      io.to(conversationId).emit("message:new", { message: serializedMessage });
      io.to(conversationId).emit("conversation:updated", {
        conversationId,
        lastMessage: serializedMessage,
        lastMessageAt: message.sentAt,
      });
    }

    res.status(201).json({ message: serializedMessage });
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
      (p) => safeId(p) !== safeId(req.user._id),
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
