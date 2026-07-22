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
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn("flex w-full mb-4", isOwn ? "justify-end" : "justify-start")}
      >
        <div
          className={cn(
            "relative max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm text-[15px] leading-relaxed",
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-white/10 text-white/90 rounded-tl-sm"
          )}
        >
          <div className="break-words whitespace-pre-wrap">{message.content}</div>
          
          <div
            className={cn(
              "mt-1 flex items-center justify-end gap-1.5 text-[10px]",
              isOwn ? "text-primary-foreground/70" : "text-white/40"
            )}
          >
            <span>{format(new Date(message.sentAt), "HH:mm")}</span>
            
            {isOwn && (
              <span className="flex items-center">
                {message.status === "read" ? (
                  <CheckCheck className="size-3.5 text-emerald-400" />
                ) : message.status === "delivered" ? (
                  <CheckCheck className="size-3.5" />
                ) : (
                  <Check className="size-3.5" />
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
