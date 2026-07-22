import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut, MessagesSquare, Settings } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth";
import { authApi } from "@/lib/api/auth";
import { extractApiError } from "@/lib/api/client";

import { useChat } from "@/hooks/useChat";
import { useMessages } from "@/hooks/useMessages";
import { ConversationSidebar } from "@/components/chat/ConversationSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { EmptyConversationState } from "@/components/chat/EmptyConversationState";
import { cn } from "@/lib/utils";

export default function InboxPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const clear = useAuthStore((s) => s.clear);

  useEffect(() => {
    document.title = "Inbox — BaatKarte";
  }, []);

  useEffect(() => {
    if (hydrated && !user) navigate("/login");
  }, [hydrated, user, navigate]);

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clear();
      toast.success("Signed out.");
      navigate("/login");
    },
  });

  // Chat hooks
  const {
    conversations,
    activeConversationId,
    unreadCounts,
    isLoading: isSidebarLoading,
    setActiveConversation,
    sendMessage,
  } = useChat();

  const {
    messages,
    isLoading: isMessagesLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useMessages(activeConversationId);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const handleSendMessage = async (content: string) => {
    if (!activeConversationId) return;
    try {
      await sendMessage.mutateAsync({ conversationId: activeConversationId, content });
    } catch (err) {
      toast.error(extractApiError(err));
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen flex-col bg-[#08070f] text-white overflow-hidden">
      {/* Global Header */}
      <header className="flex shrink-0 items-center justify-between border-b border-white/5 bg-[#141422] px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-xl bg-white/10 text-white shadow-sm border border-white/5">
            <MessagesSquare className="size-4" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white/90">
            BaatKarte
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden text-right text-xs md:block">
            <div className="font-medium text-white/90">{user.name}</div>
            <div className="text-white/40">@{user.username}</div>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={cn(
            "w-full md:w-[320px] lg:w-[380px] shrink-0 transition-transform duration-300 ease-in-out z-10",
            activeConversationId ? "hidden md:block" : "block"
          )}
        >
          <ConversationSidebar
            conversations={conversations}
            activeId={activeConversationId}
            unreadCounts={unreadCounts}
            isLoading={isSidebarLoading}
            onSelect={setActiveConversation}
          />
        </div>

        {/* Chat Window Area */}
        <div
          className={cn(
            "flex-1 min-w-0 transition-opacity duration-300 relative",
            !activeConversationId ? "hidden md:block" : "block"
          )}
        >
          {activeConversation ? (
            <ChatWindow
              conversation={activeConversation}
              messages={messages}
              isLoading={isMessagesLoading}
              isFetchingNextPage={isFetchingNextPage}
              hasNextPage={hasNextPage}
              fetchNextPage={fetchNextPage}
              onSendMessage={handleSendMessage}
              onBack={() => setActiveConversation(null)}
            />
          ) : (
            <EmptyConversationState />
          )}
        </div>
      </main>
    </div>
  );
}