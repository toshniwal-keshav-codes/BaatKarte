import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/lib/stores/auth";

const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:4000";

let socketSingleton: Socket | null = null;

function getSocket(token: string): Socket {
  if (socketSingleton?.connected) return socketSingleton;

  socketSingleton?.disconnect();
  socketSingleton = io(BASE_URL, {
    auth: { token },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socketSingleton;
}

interface UseSocketReturn {
  socket: Socket | null;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
}

export function useSocket(): UseSocketReturn {
  const accessToken = useAuthStore((s) => s.accessToken);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const socket = getSocket(accessToken);
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[socket] connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("[socket] disconnected:", reason);
    });

    socket.on("connect_error", (err) => {
      console.warn("[socket] connection error:", err.message);
    });

    return () => {
      // Don't disconnect on unmount — keep the singleton alive.
      // Only disconnect when the user logs out (accessToken becomes null).
    };
  }, [accessToken]);

  // Disconnect when token is cleared (logout)
  useEffect(() => {
    if (!accessToken && socketSingleton) {
      socketSingleton.disconnect();
      socketSingleton = null;
      socketRef.current = null;
    }
  }, [accessToken]);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("conversation:join", { conversationId });
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("conversation:leave", { conversationId });
  }, []);

  return {
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
  };
}
