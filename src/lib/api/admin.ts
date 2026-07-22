import { api } from "./client";
import type { PublicUser } from "./auth";

export interface DashboardStats {
  totalUsers: number;
  totalConversations: number;
  totalMessages: number;
  onlineUsersCount: number;
  adminCount: number;
}

export interface AuditLogItem {
  _id: string;
  adminId: {
    _id: string;
    name: string;
    email: string;
    username: string;
    avatarUrl?: string;
  };
  action: "DELETE_USER" | "DELETE_CONVERSATION" | "DELETE_MESSAGES" | "UPDATE_ROLE";
  targetType: "User" | "Conversation" | "Message";
  targetId: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface AdminUserProfile {
  user: PublicUser;
  metrics: {
    conversationsCount: number;
    messagesCount: number;
  };
}

export interface AdminConversationItem {
  id: string;
  participants: PublicUser[];
  lastMessage?: {
    content: string;
    sentAt: string;
    sender: string;
  } | null;
  lastMessageAt?: string | null;
  createdAt: string;
  messageCount: number;
}

export const adminApi = {
  getStats: () =>
    api
      .get<{ stats: DashboardStats; recentAuditLogs: AuditLogItem[] }>("/admin/stats")
      .then((r) => r.data),

  getUsers: (params: { page?: number; limit?: number; search?: string; role?: string }) =>
    api
      .get<{ users: PublicUser[]; pagination: PaginationInfo }>("/admin/users", { params })
      .then((r) => r.data),

  getUserProfile: (id: string) =>
    api.get<AdminUserProfile>(`/admin/users/${id}`).then((r) => r.data),

  updateUserRole: (id: string, role: "user" | "admin") =>
    api.patch<{ user: PublicUser }>(`/admin/users/${id}/role`, { role }).then((r) => r.data),

  deleteUser: (id: string) =>
    api.delete<{ ok: true; message: string }>(`/admin/users/${id}`).then((r) => r.data),

  getConversations: (params: { page?: number; limit?: number }) =>
    api
      .get<{ conversations: AdminConversationItem[]; pagination: PaginationInfo }>(
        "/admin/conversations",
        { params },
      )
      .then((r) => r.data),

  deleteConversation: (id: string) =>
    api.delete<{ ok: true; message: string }>(`/admin/conversations/${id}`).then((r) => r.data),

  deleteMessages: (payload: { conversationId?: string; messageIds?: string[] }) =>
    api
      .delete<{ ok: true; deletedCount: number }>("/admin/messages", { data: payload })
      .then((r) => r.data),

  getAuditLogs: (params: { page?: number; limit?: number }) =>
    api
      .get<{ auditLogs: AuditLogItem[]; pagination: PaginationInfo }>("/admin/audit-logs", {
        params,
      })
      .then((r) => r.data),

  setupInitialAdmin: () =>
    api.post<{ ok: true; user: PublicUser }>("/admin/setup-initial-admin").then((r) => r.data),
};
