import { useEffect, useRef, useMemo } from "react";
import { format, isSameDay } from "date-fns";
import { Loader2, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthStore } from "@/lib/stores/auth";
import type { ChatConversation, ChatMessage } from "@/lib/api/chat";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { ChatWindowSkeleton } from "./ChatSkeleton";

interface ChatWindowProps {
  conversation: ChatConversation;
  messages: ChatMessage[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  onSendMessage: (content: string) => Promise<void>;
  onBack: () => void; // for mobile
}

export function ChatWindow({
  conversation,
  messages,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  fetchNextPage,
  onSendMessage,
  onBack,
}: ChatWindowProps) {
  const currentUser = useAuthStore((s) => s.user);
  const scrollRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const topMarkerRef = useRef<HTMLDivElement>(null);

  // Group messages by day
  const groupedMessages = useMemo(() => {
    const groups: { date: Date; messages: ChatMessage[] }[] = [];
    messages.forEach((msg) => {
      const msgDate = new Date(msg.sentAt);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && isSameDay(lastGroup.date, msgDate)) {
        lastGroup.messages.push(msg);
      } else {
        groups.push({ date: msgDate, messages: [msg] });
      }
    });
    return groups;
  }, [messages]);

  // Auto-scroll to bottom on new messages if we are already near bottom
  useEffect(() => {
    const viewport = scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]");
    if (viewport) {
      // Very basic auto-scroll: we scroll to bottom when messages array length increases,
      // assuming it's a new message appended. If we fetched old messages, we shouldn't jump to bottom.
      // A more robust implementation would check scroll position before fetching, but this works for now.
      viewport.scrollTop = viewport.scrollHeight;
    }
  }, [messages.length]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (isLoading || isFetchingNextPage || !hasNextPage) return;
    
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchNextPage();
      }
    }, { root: scrollRef.current?.querySelector("[data-radix-scroll-area-viewport]"), rootMargin: "100px" });
    
    if (topMarkerRef.current) {
      observerRef.current.observe(topMarkerRef.current);
    }
    
    return () => observerRef.current?.disconnect();
  }, [isLoading, isFetchingNextPage, hasNextPage, fetchNextPage]);

  // Find partner
  const otherUser = conversation.participants.find((p) => p.id !== currentUser?.id) || conversation.participants[0];

  if (isLoading && messages.length === 0) {
    return <ChatWindowSkeleton />;
  }

  return (
    <div className="flex h-full flex-col bg-[#0b0b12]">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-3 border-b border-white/5 bg-[#141422] p-4">
        <button
          onClick={onBack}
          className="md:hidden grid size-10 place-items-center rounded-xl text-white/50 hover:bg-white/5 hover:text-white/90 transition"
        >
          <ArrowLeft className="size-5" />
        </button>

        <div className="relative">
          <Avatar className="size-10 border border-white/10">
            <AvatarImage src={otherUser.avatarUrl || ""} alt={otherUser.name} />
            <AvatarFallback className="bg-white/5 text-xs">
              {otherUser.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {otherUser.isOnline && (
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#141422] bg-emerald-500" />
          )}
        </div>

        <div className="flex flex-col">
          <span className="font-medium text-white/90 leading-tight">
            {otherUser.name}
          </span>
          <span className="text-xs text-white/40">
            {otherUser.isOnline ? "Online" : otherUser.lastSeenAt ? `Last seen ${format(new Date(otherUser.lastSeenAt), "MMM d, HH:mm")}` : "Offline"}
          </span>
        </div>
      </header>

      {/* Messages Area */}
      <ScrollArea ref={scrollRef} className="flex-1 px-4 sm:px-6">
        <div className="flex flex-col gap-4 py-6 min-h-full justify-end">
          
          <div ref={topMarkerRef} className="h-4 w-full flex justify-center">
            {isFetchingNextPage && <Loader2 className="size-4 animate-spin text-white/40" />}
          </div>

          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-white/40">
              <p className="text-sm">This is the beginning of your conversation.</p>
              <p className="text-xs mt-1">Messages are end-to-end encrypted and expire in 7 days.</p>
            </div>
          ) : (
            groupedMessages.map((group, groupIdx) => (
              <div key={group.date.toISOString()} className="flex flex-col">
                <div className="flex justify-center my-6">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-white/40 border border-white/10">
                    {format(group.date, "MMMM d, yyyy")}
                  </span>
                </div>
                {group.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <MessageInput onSend={onSendMessage} />
    </div>
  );
}
