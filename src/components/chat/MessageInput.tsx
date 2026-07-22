import { useState, useRef, useEffect } from "react";
import { Smile, SendHorizonal, Loader2 } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [content]);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed || isSending || disabled) return;

    try {
      setIsSending(true);
      await onSend(trimmed);
      setContent("");
      textareaRef.current?.focus();
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setContent((prev) => prev + emojiData.emoji);
    textareaRef.current?.focus();
  };

  return (
    <div className="border-t border-[#BEB0A7]/10 bg-[#040303] p-4">
      <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-2xl border border-[#BEB0A7]/15 bg-[#0A0C0B] p-2.5 shadow-xl transition-all duration-200 focus-within:border-[#8B9D83] focus-within:ring-2 focus-within:ring-[#8B9D83]/20">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className="grid size-10 shrink-0 place-items-center rounded-xl text-[#6A7B76] hover:bg-[#3A4E48]/30 hover:text-[#BEB0A7] disabled:opacity-50 transition cursor-pointer"
            >
              <Smile className="size-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-auto p-0 border border-[#BEB0A7]/15 bg-[#0A0C0B] rounded-2xl overflow-hidden mb-2 shadow-2xl">
            <EmojiPicker
              theme={Theme.DARK}
              onEmojiClick={onEmojiClick}
              lazyLoadEmojis
            />
          </PopoverContent>
        </Popover>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 4000))}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          placeholder="Type your message..."
          className="max-h-[120px] min-h-[40px] w-full resize-none bg-transparent py-2 text-sm text-white placeholder:text-[#BEB0A7]/30 focus:outline-none disabled:opacity-50"
          rows={1}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={disabled || isSending || !content.trim()}
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl transition-all duration-200 cursor-pointer border shadow-sm",
            content.trim() 
              ? "bg-[#3A4E48] text-white border-[#8B9D83]/40 hover:bg-[#475F58] shadow-[#3A4E48]/30" 
              : "bg-[#040303] text-[#6A7B76] border-[#BEB0A7]/10 disabled:cursor-not-allowed"
          )}
        >
          {isSending ? (
            <Loader2 className="size-5 animate-spin text-[#8B9D83]" />
          ) : (
            <SendHorizonal className="size-5 ml-0.5" />
          )}
        </motion.button>
      </div>
      <div className="mx-auto max-w-4xl mt-2 text-right">
        <span className={cn("text-[10px] font-mono", content.length >= 4000 ? "text-rose-400 font-bold" : "text-[#6A7B76]/50")}>
          {content.length} / 4000
        </span>
      </div>
    </div>
  );
}
