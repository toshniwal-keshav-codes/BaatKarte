import { forwardRef } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
import type { ChatMessage } from "@/lib/api/chat";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores/auth";

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar?: boolean;
}

export const MessageBubble = forwardRef<HTMLDivElement, MessageBubbleProps>(
  ({ message }, ref) => {
    const currentUser = useAuthStore((s) => s.user);
    const isOwn = message.sender.id === currentUser?.id;

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={cn("flex w-full mb-3.5", isOwn ? "justify-end" : "justify-start")}
      >
        <div
          className={cn(
            "relative max-w-[78%] md:max-w-[68%] rounded-2xl px-4 py-3 shadow-md text-sm leading-relaxed border transition-all",
            isOwn
              ? "bg-[#3A4E48] text-[#BEB0A7] border-[#8B9D83]/30 rounded-tr-xs shadow-[#040303]/40"
              : "bg-[#0D1110] text-[#BEB0A7]/95 border-[#BEB0A7]/15 rounded-tl-xs shadow-[#040303]/20"
          )}
        >
          <div className="break-words whitespace-pre-wrap selection:bg-[#8B9D83]/40">{message.content}</div>
          
          <div
            className={cn(
              "mt-1.5 flex items-center justify-end gap-1.5 text-[10px] font-mono tracking-tight",
              isOwn ? "text-[#BEB0A7]/70" : "text-[#6A7B76]"
            )}
          >
            <span>{format(new Date(message.sentAt), "HH:mm")}</span>
            
            {isOwn && (
              <span className="flex items-center">
                {message.status === "read" ? (
                  <CheckCheck className="size-3.5 text-[#8B9D83]" />
                ) : message.status === "delivered" ? (
                  <CheckCheck className="size-3.5 text-[#BEB0A7]/60" />
                ) : (
                  <Check className="size-3.5 text-[#BEB0A7]/40" />
                )}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    );
  }
);
MessageBubble.displayName = "MessageBubble";
