import { formatDistanceToNowStrict, isToday, format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ChatConversation } from "@/lib/api/chat";
import { useAuthStore } from "@/lib/stores/auth";
import { cn } from "@/lib/utils";

interface ConversationItemProps {
  conversation: ChatConversation;
  isActive: boolean;
  unreadCount?: number;
  onClick: () => void;
}

function formatTime(dateStr?: string | null) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isToday(date)) {
    return format(date, "HH:mm");
  }
  return formatDistanceToNowStrict(date, { addSuffix: false })
    .replace(" seconds", "s")
    .replace(" minutes", "m")
    .replace(" hours", "h")
    .replace(" days", "d")
    .replace(" months", "mo")
    .replace(" years", "y");
}

export function ConversationItem({ conversation, isActive, unreadCount = 0, onClick }: ConversationItemProps) {
  const currentUser = useAuthStore((s) => s.user);
  
  // Find the other participant
  const otherUser = conversation.participants.find((p) => p.id !== currentUser?.id) || conversation.participants[0];
  if (!otherUser) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all",
        isActive ? "bg-white/10" : "hover:bg-white/5",
      )}
    >
      <div className="relative">
        <Avatar className="size-12 border border-white/10">
          <AvatarImage src={otherUser.avatarUrl || ""} alt={otherUser.name} />
          <AvatarFallback className="bg-white/5 text-sm">
            {otherUser.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {otherUser.isOnline && (
          <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#0b0b12] bg-emerald-500" />
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="truncate font-medium text-white/90">
            {otherUser.name}
          </span>
          <span className="shrink-0 text-[11px] text-white/40">
            {formatTime(conversation.lastMessageAt)}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "truncate text-sm",
            unreadCount > 0 ? "font-medium text-white/80" : "text-white/50"
          )}>
            {conversation.lastMessage?.content || <span className="italic">No messages yet</span>}
          </span>
          
          {unreadCount > 0 && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
