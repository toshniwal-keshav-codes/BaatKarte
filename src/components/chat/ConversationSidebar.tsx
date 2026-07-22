import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2, UserPlus } from "lucide-react";
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
    <div className={`flex flex-col bg-[#0A0C0B] h-full ${className}`}>
      {/* Search Header */}
      <div className="p-4 border-b border-[#BEB0A7]/10">
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6A7B76]" />
          <input
            {...form.register("email")}
            placeholder="Start conversation by email..."
            className="w-full rounded-xl border border-[#BEB0A7]/15 bg-[#040303] py-2.5 pl-10 pr-9 text-xs text-white placeholder:text-[#BEB0A7]/40 outline-none transition-all duration-200 focus:border-[#8B9D83] focus:ring-2 focus:ring-[#8B9D83]/20"
            disabled={isSearching}
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-[#8B9D83]" />
          )}
        </form>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading ? (
          <SidebarSkeleton />
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full">
            <div className="size-12 rounded-2xl bg-[#3A4E48]/20 border border-[#8B9D83]/20 grid place-items-center mb-3">
              <UserPlus className="size-6 text-[#8B9D83]" />
            </div>
            <p className="text-sm font-semibold text-white">No active chats</p>
            <p className="mt-1 text-xs text-[#6A7B76] max-w-[200px]">
              Enter an email address in the search box above to start messaging.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
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
