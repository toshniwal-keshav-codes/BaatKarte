import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { chatApi } from "@/lib/api/chat";
import { useChatStore } from "@/lib/stores/chat";

export function useMessages(conversationId: string | null) {
  const store = useChatStore();

  const query = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: async ({ pageParam }) => {
      if (!conversationId) return { messages: [], hasMore: false };
      return chatApi.getMessages(conversationId, pageParam);
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || lastPage.messages.length === 0) return undefined;
      // The cursor is the sentAt timestamp of the oldest message in the page (which is the first item in the array, as the array is ordered oldest->newest in our UI)
      return lastPage.messages[0]?.sentAt;
    },
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5,
  });

  // Sync to Zustand store (optional, but good if we want to manipulate it directly or share it)
  // For infinite scroll, React Query manages the pages well.
  // We'll flatten the pages to get a single array of messages.
  const messages = query.data?.pages.flatMap((page) => page.messages) ?? [];
  
  // Combine with optimistic messages or real-time messages from store if we need to.
  // Since we append to store on socket event, we should merge them or just rely on query cache invalidation.
  // In `useChat`, we invalidate the query on new message, so React Query will refetch the latest page.
  // To avoid flicker, we can also use the store's appended messages.
  
  // We'll merge the store messages and query messages.
  const storeMessages = (conversationId ? store.messages[conversationId] : []) || [];
  
  // Map by ID to deduplicate (query cache might fetch the new message before store does, or vice versa)
  const messageMap = new Map();
  for (const msg of messages) {
    messageMap.set(msg.id, msg);
  }
  for (const msg of storeMessages) {
    messageMap.set(msg.id, msg);
  }
  
  // Sort by sentAt ascending (oldest first)
  const mergedMessages = Array.from(messageMap.values()).sort(
    (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
  );

  return {
    ...query,
    messages: mergedMessages,
  };
}
