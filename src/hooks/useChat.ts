import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi, type ChatMessage } from "@/lib/api/chat";
import { useChatStore } from "@/lib/stores/chat";
import { useSocket } from "./useSocket";

export function useChat() {
  const queryClient = useQueryClient();
  const { socket, joinConversation, leaveConversation } = useSocket();
  const store = useChatStore();

  // Fetch all conversations
  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: () => chatApi.getConversations().then((res) => res.conversations),
    staleTime: 1000 * 60 * 5, // 5 mins
  });

  // Sync query results to Zustand store
  useEffect(() => {
    if (conversationsQuery.data) {
      store.setConversations(conversationsQuery.data);
    }
  }, [conversationsQuery.data]);

  // Handle incoming Socket.io events
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = ({ message }: { message: ChatMessage }) => {
      // Add message to store
      store.appendMessage(message.conversationId, message);

      // Invalidate messages query so the next fetch includes it
      queryClient.invalidateQueries({ queryKey: ["messages", message.conversationId] });

      // If this conversation is not active, increment unread count
      if (store.activeConversationId !== message.conversationId) {
        store.incrementUnread(message.conversationId);
      } else {
        // We are looking at it, so we can mark it read (future feature: emit 'message:read')
      }
    };

    const handleConversationUpdated = ({
      conversationId,
      lastMessage,
      lastMessageAt,
    }: {
      conversationId: string;
      lastMessage: any;
      lastMessageAt: string;
    }) => {
      // Find the conversation and update it
      const existing = store.conversations.find((c) => c.id === conversationId);
      if (existing) {
        store.upsertConversation({
          ...existing,
          lastMessage,
          lastMessageAt,
        });
      } else {
        // If we don't have it, invalidate the conversations list to fetch it
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      }
    };

    socket.on("message:new", handleNewMessage);
    socket.on("conversation:updated", handleConversationUpdated);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("conversation:updated", handleConversationUpdated);
    };
  }, [socket, store.conversations, store.activeConversationId, queryClient]);

  // Mutations
  const sendMessage = useMutation({
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      chatApi.sendMessage(conversationId, content),
  });

  const setActiveConversation = useCallback(
    (id: string | null) => {
      if (store.activeConversationId) {
        leaveConversation(store.activeConversationId);
      }
      if (id) {
        joinConversation(id);
        store.clearUnread(id);
      }
      store.setActiveConversation(id);
    },
    [store.activeConversationId, joinConversation, leaveConversation],
  );

  return {
    conversations: store.conversations,
    activeConversationId: store.activeConversationId,
    unreadCounts: store.unreadCounts,
    isLoading: conversationsQuery.isLoading,
    isError: conversationsQuery.isError,
    setActiveConversation,
    sendMessage,
    refetch: conversationsQuery.refetch,
  };
}
