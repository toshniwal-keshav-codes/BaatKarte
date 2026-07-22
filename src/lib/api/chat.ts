import { api } from "./client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatUser {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeenAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: ChatUser;
  content: string;
  status: "sent" | "delivered" | "read";
  sentAt: string;
  expiresAt: string;
}

export interface ChatConversation {
  id: string;
  participants: ChatUser[];
  lastMessage: Pick<ChatMessage, "id" | "content" | "sender" | "sentAt" | "status"> | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MessagesPage {
  messages: ChatMessage[];
  hasMore: boolean;
}

// ─── API Methods ──────────────────────────────────────────────────────────────

export const chatApi = {
  searchUser: (email: string) =>
    api.get<{ user: ChatUser }>("/chat/users/search", { params: { email } }).then((r) => r.data),

  createOrOpenConversation: (email: string) =>
    api
      .post<{ conversation: ChatConversation }>("/chat/conversations", { email })
      .then((r) => r.data),

  getConversations: () =>
    api.get<{ conversations: ChatConversation[] }>("/chat/conversations").then((r) => r.data),

  getMessages: (conversationId: string, cursor?: string, limit = 30) =>
    api
      .get<MessagesPage>(`/chat/conversations/${conversationId}/messages`, {
        params: { cursor, limit },
      })
      .then((r) => r.data),

  sendMessage: (conversationId: string, content: string) =>
    api
      .post<{ message: ChatMessage }>(`/chat/conversations/${conversationId}/messages`, { content })
      .then((r) => r.data),

  deleteConversation: (conversationId: string) =>
    api.delete(`/chat/conversations/${conversationId}`).then((r) => r.data),
};
