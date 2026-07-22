import { create } from "zustand";
import type { ChatConversation, ChatMessage } from "@/lib/api/chat";

interface ChatState {
  // Sidebar
  conversations: ChatConversation[];
  setConversations: (convs: ChatConversation[]) => void;
  upsertConversation: (conv: ChatConversation) => void;
  removeConversation: (id: string) => void;

  // Active conversation
  activeConversationId: string | null;
  setActiveConversation: (id: string | null) => void;

  // Messages — keyed by conversationId
  messages: Record<string, ChatMessage[]>;
  setMessages: (conversationId: string, msgs: ChatMessage[]) => void;
  prependMessages: (conversationId: string, msgs: ChatMessage[]) => void;
  appendMessage: (conversationId: string, msg: ChatMessage) => void;

  // Unread counts
  unreadCounts: Record<string, number>;
  setUnread: (conversationId: string, count: number) => void;
  incrementUnread: (conversationId: string) => void;
  clearUnread: (conversationId: string) => void;

  // Reset
  reset: () => void;
}

const initialState = {
  conversations: [],
  activeConversationId: null,
  messages: {},
  unreadCounts: {},
};

export const useChatStore = create<ChatState>()((set) => ({
  ...initialState,

  // ── Conversations ──────────────────────────────────────────────────────────
  setConversations: (conversations) => set({ conversations }),

  upsertConversation: (conv) =>
    set((state) => {
      const existing = state.conversations.find((c) => c.id === conv.id);
      if (existing) {
        return {
          conversations: state.conversations
            .map((c) => (c.id === conv.id ? { ...c, ...conv } : c))
            .sort((a, b) => {
              const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
              const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
              return bTime - aTime;
            }),
        };
      }
      return { conversations: [conv, ...state.conversations] };
    }),

  removeConversation: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
    })),

  // ── Active conversation ────────────────────────────────────────────────────
  setActiveConversation: (activeConversationId) => set({ activeConversationId }),

  // ── Messages ───────────────────────────────────────────────────────────────
  setMessages: (conversationId, msgs) =>
    set((state) => ({ messages: { ...state.messages, [conversationId]: msgs } })),

  prependMessages: (conversationId, msgs) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...msgs, ...(state.messages[conversationId] ?? [])],
      },
    })),

  appendMessage: (conversationId, msg) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] ?? []), msg],
      },
    })),

  // ── Unread ─────────────────────────────────────────────────────────────────
  setUnread: (conversationId, count) =>
    set((state) => ({ unreadCounts: { ...state.unreadCounts, [conversationId]: count } })),

  incrementUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: {
        ...state.unreadCounts,
        [conversationId]: (state.unreadCounts[conversationId] ?? 0) + 1,
      },
    })),

  clearUnread: (conversationId) =>
    set((state) => ({
      unreadCounts: { ...state.unreadCounts, [conversationId]: 0 },
    })),

  // ── Reset ──────────────────────────────────────────────────────────────────
  reset: () => set(initialState),
}));
