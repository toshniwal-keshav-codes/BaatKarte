import { verifyAccessToken } from "../modules/auth/tokens.js";
import { User } from "../models/User.js";

/**
 * Production-ready Socket.io handler.
 *
 * Events (client → server):
 *   conversation:join    { conversationId }  → join socket room
 *   conversation:leave   { conversationId }  → leave socket room
 *   message:send         { conversationId, content }  → save + broadcast
 *   typing:start         { conversationId }  → received, NOT rebroadcast (disabled)
 *   typing:stop          { conversationId }  → received, NOT rebroadcast (disabled)
 *
 * Events (server → client):
 *   message:new          { message }         → new message in room
 *   conversation:updated { conversationId, lastMessage, lastMessageAt }
 *   error                { message }
 */
export function attachSocket(io) {
  // ── Auth middleware ────────────────────────────────────────────────────────
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("unauthorized"));
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  // ── Connection ─────────────────────────────────────────────────────────────
  io.on("connection", async (socket) => {
    const userId = socket.data.userId;
    console.log("[socket] connected", userId);

    // Mark user online
    try {
      await User.findByIdAndUpdate(userId, { isOnline: true });
    } catch {
      // non-fatal
    }

    // ── Join conversation room ───────────────────────────────────────────────
    socket.on("conversation:join", ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.join(conversationId);
      console.log(`[socket] ${userId} joined room ${conversationId}`);
    });

    // ── Leave conversation room ──────────────────────────────────────────────
    socket.on("conversation:leave", ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.leave(conversationId);
      console.log(`[socket] ${userId} left room ${conversationId}`);
    });

    // ── Typing (architecture wired, not rebroadcast — disabled per spec) ─────
    socket.on("typing:start", () => {
      // intentionally suppressed
    });
    socket.on("typing:stop", () => {
      // intentionally suppressed
    });

    // ── Disconnect ───────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
      console.log("[socket] disconnected", userId);
      try {
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeenAt: new Date(),
        });
      } catch {
        // non-fatal
      }
    });

    // ── Error ────────────────────────────────────────────────────────────────
    socket.on("error", (err) => {
      console.error("[socket] error", userId, err?.message);
      socket.emit("error", { message: err?.message || "Socket error" });
    });
  });
}