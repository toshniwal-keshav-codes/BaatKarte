import { useState, useCallback } from "react";
import type {
  MediaCallSession,
  NotificationPayload,
  GroupMetadata,
  TypingIndicatorState,
} from "@/types/extensions";
import { clientExtensionRegistry } from "@/lib/extensions/extensionRegistry";

/**
 * Custom React Hooks providing clean extension points for future features:
 * - Media Calls & Screen Sharing
 * - Notifications & Push Notifications
 * - Groups & Channels Management
 * - Presence & Typing Indicators
 */

export function useMediaCallExtension() {
  const [callSession, setCallSession] = useState<MediaCallSession | null>(null);

  const initiateCall = useCallback((conversationId: string, type: "audio" | "video" | "screenshare") => {
    console.log(`[extension-hook] Initiate ${type} call for conversation ${conversationId}`);
    // Future WebRTC signaling hook
  }, []);

  const endCall = useCallback(() => {
    setCallSession(null);
  }, []);

  return { callSession, initiateCall, endCall };
}

export function useNotificationExtension() {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);

  const addNotification = useCallback((notification: NotificationPayload) => {
    setNotifications((prev) => [notification, ...prev]);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return { notifications, addNotification, clearNotifications };
}

export function useGroupExtension() {
  const [groupMetadata, setGroupMetadata] = useState<GroupMetadata | null>(null);

  const updateGroup = useCallback((metadata: Partial<GroupMetadata>) => {
    setGroupMetadata((prev) => (prev ? { ...prev, ...metadata } : (metadata as GroupMetadata)));
  }, []);

  return { groupMetadata, updateGroup };
}

export function useTypingExtension() {
  const [typingState, setTypingState] = useState<TypingIndicatorState | null>(null);

  const startTyping = useCallback((conversationId: string) => {
    // Modular extension point for typing indicators
  }, []);

  const stopTyping = useCallback((conversationId: string) => {
    // Modular extension point for typing indicators
  }, []);

  return { typingState, startTyping, stopTyping };
}

export function usePluginRegistry() {
  return clientExtensionRegistry;
}
