import { formatDistanceToNowStrict, isToday, format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { ChatConversation } from "@/lib/api/chat";
import { useAuthStore } from "@/lib/stores/auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <motion.button
      whileHover={{ scale: 1.01, x: 2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        "group relative flex w-full items-center gap-3.5 rounded-xl p-3 text-left transition-all duration-200 cursor-pointer overflow-hidden border",
        isActive
          ? "bg-[#3A4E48]/30 border-[#8B9D83]/30 shadow-md shadow-[#040303]/40"
          : "border-transparent hover:bg-[#101413] hover:border-[#BEB0A7]/10"
      )}
    >
      {/* Active bar indicator */}
      {isActive && (
        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#8B9D83]" />
      )}

      <div className="relative">
        <Avatar className="size-11 border border-[#BEB0A7]/20 shadow-sm">
          <AvatarImage src={otherUser.avatarUrl || ""} alt={otherUser.name} />
          <AvatarFallback className="bg-[#3A4E48] text-white text-xs font-bold">
            {otherUser.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        {otherUser.isOnline && (
          <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-[#0A0C0B] bg-[#8B9D83] shadow-sm shadow-[#8B9D83]" />
        )}
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between">
          <span className={cn(
            "truncate font-semibold text-sm transition-colors",
            isActive ? "text-white" : "text-[#BEB0A7] group-hover:text-white"
          )}>
            {otherUser.name}
          </span>
          <span className="shrink-0 text-[10px] font-mono text-[#6A7B76]">
            {formatTime(conversation.lastMessageAt)}
          </span>
        </div>
        
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className={cn(
            "truncate text-xs",
            unreadCount > 0 ? "font-semibold text-[#BEB0A7]" : "text-[#6A7B76]"
          )}>
            {conversation.lastMessage?.content || <span className="italic opacity-60">No messages yet</span>}
          </span>
          
          {unreadCount > 0 && (
            <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-[#8B9D83] text-[10px] font-bold text-[#040303] shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
