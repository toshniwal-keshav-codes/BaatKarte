import { verifyAccessToken } from "../modules/auth/tokens.js";

// Placeholder socket wiring — expanded in later modules (messages, presence, typing).
export function attachSocket(io) {
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

  io.on("connection", (socket) => {
    console.log("[socket] connected", socket.data.userId);
    socket.on("disconnect", () => {
      console.log("[socket] disconnected", socket.data.userId);
    });
  });
}