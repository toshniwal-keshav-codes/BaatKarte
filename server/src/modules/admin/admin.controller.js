import { User } from "../../models/User.js";
import { Conversation } from "../../models/Conversation.js";
import { Message } from "../../models/Message.js";
import { AuditLog } from "../../models/AuditLog.js";
import { HttpError } from "../../middleware/error.js";
import { adminQuerySchema, updateRoleSchema, deleteMessagesSchema } from "./admin.schemas.js";

// Helper for audit log creation
async function createAuditEntry(adminId, action, targetType, targetId, details = {}) {
  try {
    await AuditLog.create({
      adminId,
      action,
      targetType,
      targetId,
      details,
    });
  } catch (err) {
    console.error("[AuditLog] error creating entry:", err);
  }
}

/**
 * GET /api/admin/stats
 * Dashboard overview statistics
 */
export async function getDashboardStats(_req, res, next) {
  try {
    const [
      totalUsers,
      totalConversations,
      totalMessages,
      onlineUsersCount,
      adminCount,
      recentAuditLogs,
    ] = await Promise.all([
      User.countDocuments(),
      Conversation.countDocuments(),
      Message.countDocuments(),
      User.countDocuments({ isOnline: true }),
      User.countDocuments({ role: "admin" }),
      AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(5)
        .populate("adminId", "name email username avatarUrl"),
    ]);

    res.json({
      stats: {
        totalUsers,
        totalConversations,
        totalMessages,
        onlineUsersCount,
        adminCount,
      },
      recentAuditLogs,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users?page=1&limit=20&search=john&role=all
 * Paginated user management list with search and filter
 */
export async function getUsers(req, res, next) {
  try {
    const { page, limit, search, role } = adminQuerySchema.parse(req.query);

    const filter = {};

    if (role && role !== "all") {
      filter.role = role;
    }

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { name: searchRegex },
        { username: searchRegex },
        { email: searchRegex },
      ];
    }

    const total = await User.countDocuments(filter);
    const pages = Math.ceil(total / limit) || 1;

    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({
      users: users.map((u) => u.toPublic()),
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users/:id
 * Detailed user profile with activity metrics
 */
export async function getUserProfile(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return next(new HttpError(404, "User not found", "user_not_found"));

    const [conversationsCount, messagesCount] = await Promise.all([
      Conversation.countDocuments({ participants: id }),
      Message.countDocuments({ sender: id }),
    ]);

    res.json({
      user: user.toPublic(),
      metrics: {
        conversationsCount,
        messagesCount,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/users/:id/role
 * Body: { role: "admin" | "user" }
 */
export async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = updateRoleSchema.parse(req.body);

    const user = await User.findById(id);
    if (!user) return next(new HttpError(404, "User not found", "user_not_found"));

    if (user.role === role) {
      return res.json({ user: user.toPublic() });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    await createAuditEntry(req.user._id, "UPDATE_ROLE", "User", user._id.toString(), {
      email: user.email,
      username: user.username,
      previousRole,
      newRole: role,
    });

    res.json({ user: user.toPublic() });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/users/:id
 * Delete user and clean up conversations and messages
 */
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return next(new HttpError(404, "User not found", "user_not_found"));

    // Find conversations where user is participant
    const userConvs = await Conversation.find({ participants: id });
    const convIds = userConvs.map((c) => c._id);

    // Delete messages in those conversations + sent by user
    const [deletedMessagesRes, deletedConvsRes] = await Promise.all([
      Message.deleteMany({
        $or: [{ sender: id }, { conversationId: { $in: convIds } }],
      }),
      Conversation.deleteMany({ _id: { $in: convIds } }),
      User.findByIdAndDelete(id),
    ]);

    await createAuditEntry(req.user._id, "DELETE_USER", "User", id, {
      name: user.name,
      email: user.email,
      username: user.username,
      deletedConversations: deletedConvsRes.deletedCount,
      deletedMessages: deletedMessagesRes.deletedCount,
    });

    res.json({ ok: true, message: `User ${user.email} deleted successfully` });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/conversations?page=1&limit=20
 * Paginated conversation management list
 */
export async function getConversations(req, res, next) {
  try {
    const { page, limit } = adminQuerySchema.parse(req.query);

    const total = await Conversation.countDocuments();
    const pages = Math.ceil(total / limit) || 1;

    const conversations = await Conversation.find()
      .sort({ lastMessageAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("participants", "name username email avatarUrl isOnline")
      .populate({ path: "lastMessage", select: "content sender sentAt" });

    // Aggregate message counts for each conversation
    const convIds = conversations.map((c) => c._id);
    const messageCounts = await Message.aggregate([
      { $match: { conversationId: { $in: convIds } } },
      { $group: { _id: "$conversationId", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(messageCounts.map((m) => [m._id.toString(), m.count]));

    const enriched = conversations.map((c) => ({
      id: c._id.toString(),
      participants: c.participants,
      lastMessage: c.lastMessage,
      lastMessageAt: c.lastMessageAt,
      createdAt: c.createdAt,
      messageCount: countMap.get(c._id.toString()) || 0,
    }));

    res.json({
      conversations: enriched,
      pagination: { total, page, limit, pages },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/conversations/:id
 * Delete single conversation and all its messages
 */
export async function deleteConversation(req, res, next) {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);
    if (!conversation)
      return next(new HttpError(404, "Conversation not found", "not_found"));

    const deletedMessages = await Message.deleteMany({ conversationId: id });
    await conversation.deleteOne();

    await createAuditEntry(req.user._id, "DELETE_CONVERSATION", "Conversation", id, {
      deletedMessagesCount: deletedMessages.deletedCount,
      participantIds: conversation.participants,
    });

    res.json({ ok: true, message: "Conversation deleted" });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/messages?conversationId=&page=1&limit=30
 * List messages with optional conversation filter
 */
export async function getMessages(req, res, next) {
  try {
    const { page, limit } = adminQuerySchema.parse(req.query);
    const { conversationId } = req.query;

    const filter = {};
    if (conversationId) {
      filter.conversationId = conversationId;
    }

    const total = await Message.countDocuments(filter);
    const pages = Math.ceil(total / limit) || 1;

    const messages = await Message.find(filter)
      .sort({ sentAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("sender", "name username email avatarUrl");

    res.json({
      messages,
      pagination: { total, page, limit, pages },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/messages
 * Delete specified messages or all messages in a conversation
 */
export async function deleteMessages(req, res, next) {
  try {
    const { conversationId, messageIds } = deleteMessagesSchema.parse(req.body);

    if (!conversationId && (!messageIds || messageIds.length === 0)) {
      return next(
        new HttpError(400, "Provide conversationId or messageIds", "missing_params"),
      );
    }

    let deletedCount = 0;

    if (messageIds && messageIds.length > 0) {
      const result = await Message.deleteMany({ _id: { $in: messageIds } });
      deletedCount = result.deletedCount;
      await createAuditEntry(
        req.user._id,
        "DELETE_MESSAGES",
        "Message",
        messageIds.join(", "),
        { count: deletedCount },
      );
    } else if (conversationId) {
      const result = await Message.deleteMany({ conversationId });
      deletedCount = result.deletedCount;

      // Reset lastMessage on conversation
      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: null,
        lastMessageAt: null,
      });

      await createAuditEntry(
        req.user._id,
        "DELETE_MESSAGES",
        "Conversation",
        conversationId,
        { count: deletedCount },
      );
    }

    res.json({ ok: true, deletedCount });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/audit-logs?page=1&limit=20
 * View audit log history
 */
export async function getAuditLogs(req, res, next) {
  try {
    const { page, limit } = adminQuerySchema.parse(req.query);

    const total = await AuditLog.countDocuments();
    const pages = Math.ceil(total / limit) || 1;

    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("adminId", "name email username avatarUrl");

    res.json({
      auditLogs: logs,
      pagination: { total, page, limit, pages },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/setup-initial-admin
 * Utility route: allows promoting logged-in user to admin IF there are currently no admins in the DB.
 */
export async function setupInitialAdmin(req, res, next) {
  try {
    const adminExists = await User.exists({ role: "admin" });
    if (adminExists) {
      return next(
        new HttpError(
          400,
          "Admin already exists in system. Request admin promotion from existing admin.",
          "admin_exists",
        ),
      );
    }

    req.user.role = "admin";
    await req.user.save();

    await createAuditEntry(req.user._id, "UPDATE_ROLE", "User", req.user._id.toString(), {
      reason: "Initial admin setup",
      newRole: "admin",
    });

    res.json({ ok: true, user: req.user.toPublic() });
  } catch (err) {
    next(err);
  }
}
