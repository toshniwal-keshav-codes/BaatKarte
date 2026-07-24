/**
 * Feature Extension Type Definitions for BaatKarte Client.
 * Establishes typed contracts for future module additions:
 *
 * 1. Profile Picture, Bio, Status, Last Seen
 * 2. Typing Indicator, Delivered Status, Read Receipts
 * 3. Pinned Chats, Archived Chats, Blocked Users
 * 4. Groups, Channels
 * 5. Voice Messages, File Sharing
 * 6. Video Calls, Screen Sharing
 * 7. End-to-End Encryption (E2EE)
 * 8. AI Content Moderation
 * 9. Notifications, Push Notifications
 */

export type UserStatusType = "online" | "away" | "busy" | "offline";

export interface ExtendedUserProfile {
  avatarUrl?: string;
  bio?: string;
  customStatus?: string;
  statusType?: UserStatusType;
  lastSeenAt?: string;
  isBlocked?: boolean;
}

export interface MessageReceipt {
  messageId: string;
  deliveredToUserIds: string[];
  readByUserIds: string[];
  deliveredAt?: string;
  readAt?: string;
}

export interface TypingIndicatorState {
  conversationId: string;
  typingUserIds: string[];
}

export interface ChatOrganizationState {
  isPinned: boolean;
  isArchived: boolean;
  pinnedAt?: string;
  archivedAt?: string;
}

export type ConversationGroupType = "direct" | "group" | "channel";

export interface GroupMetadata {
  type: ConversationGroupType;
  title?: string;
  avatarUrl?: string;
  adminIds?: string[];
  memberCount?: number;
  onlyAdminsCanPost?: boolean;
}

export type AttachmentType = "image" | "video" | "audio" | "document" | "voice";

export interface FileAttachment {
  id: string;
  type: AttachmentType;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  durationSeconds?: number; // For voice messages
}

export type CallType = "audio" | "video" | "screenshare";
export type CallState = "idle" | "ringing" | "connecting" | "active" | "ended";

export interface MediaCallSession {
  sessionId: string;
  conversationId: string;
  callType: CallType;
  state: CallState;
  participants: string[];
  isScreenSharing?: boolean;
}

export interface EncryptionHeader {
  isEncrypted: boolean;
  keyVersion?: string;
  iv?: string;
  mac?: string;
}

export interface ModerationResult {
  flagged: boolean;
  score: number;
  reason?: string;
  actionTaken?: "none" | "warn" | "block";
}

export interface NotificationPayload {
  id: string;
  type: "message" | "mention" | "call" | "system";
  title: string;
  body: string;
  data?: Record<string, unknown>;
  createdAt: string;
  read: boolean;
}
