import { useState, useRef, useEffect } from "react";
import { Smile, SendHorizonal, Loader2 } from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
    <div className="border-t border-white/5 bg-[#0b0b12] p-4">
      <div className="mx-auto flex max-w-4xl items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className="grid size-10 shrink-0 place-items-center rounded-xl text-white/40 hover:bg-white/10 hover:text-white/90 disabled:opacity-50 transition"
            >
              <Smile className="size-5" />
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" align="start" className="w-auto p-0 border-none rounded-2xl overflow-hidden mb-2 shadow-2xl">
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
          placeholder="Type a message..."
          className="max-h-[120px] min-h-[40px] w-full resize-none bg-transparent py-2.5 text-[15px] text-white placeholder:text-white/30 focus:outline-none disabled:opacity-50 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
          rows={1}
        />

        <button
          onClick={handleSend}
          disabled={disabled || isSending || !content.trim()}
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl transition-all",
            content.trim() 
              ? "bg-primary text-primary-foreground hover:bg-primary/90" 
              : "bg-white/5 text-white/30"
          )}
        >
          {isSending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <SendHorizonal className="size-5 ml-0.5" />
          )}
        </button>
      </div>
      <div className="mx-auto max-w-4xl mt-2 text-right">
        <span className={cn("text-[10px]", content.length >= 4000 ? "text-destructive" : "text-white/20")}>
          {content.length} / 4000
        </span>
      </div>
    </div>
  );
}
