import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2 } from "lucide-react";
import { chatApi } from "@/lib/api/chat";
import { searchUserSchema, type SearchUserValues } from "@/lib/validation/chat";
import { extractApiError } from "@/lib/api/client";
import { toast } from "sonner";
import { ConversationItem } from "./ConversationItem";
import { SidebarSkeleton } from "./ChatSkeleton";
import type { ChatConversation } from "@/lib/api/chat";

interface ConversationSidebarProps {
  conversations: ChatConversation[];
  activeId: string | null;
  unreadCounts: Record<string, number>;
  isLoading: boolean;
  onSelect: (id: string) => void;
  className?: string;
}

export function ConversationSidebar({
  conversations,
  activeId,
  unreadCounts,
  isLoading,
  onSelect,
  className = "",
}: ConversationSidebarProps) {
  const [isSearching, setIsSearching] = useState(false);

  const form = useForm<SearchUserValues>({
    resolver: zodResolver(searchUserSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: SearchUserValues) => {
    try {
      setIsSearching(true);
      // Create or open directly
      const res = await chatApi.createOrOpenConversation(values.email);
      onSelect(res.conversation.id);
      form.reset();
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={`flex flex-col bg-[#141422] border-r border-white/5 h-full ${className}`}>
      <div className="p-4 border-b border-white/5">
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/40" />
          <input
            {...form.register("email")}
            placeholder="Search user by email..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={isSearching}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-white/40" />
          )}
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {isLoading ? (
          <SidebarSkeleton />
        ) : conversations.length === 0 ? (
          <div className="p-6 text-center text-sm text-white/40">
            No conversations yet. Search an email above to start.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {conversations.map((c) => (
              <ConversationItem
                key={c.id}
                conversation={c}
                isActive={c.id === activeId}
                unreadCount={unreadCounts[c.id]}
                onClick={() => onSelect(c.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
