import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, Loader2, UserPlus, X, UserCheck } from "lucide-react";
import { chatApi, type ChatUser, type ChatConversation } from "@/lib/api/chat";
import { searchUserSchema, type SearchUserValues } from "@/lib/validation/chat";
import { extractApiError } from "@/lib/api/client";
import { toast } from "sonner";
import { ConversationItem } from "./ConversationItem";
import { SidebarSkeleton } from "./ChatSkeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  const [searchResults, setSearchResults] = useState<ChatUser[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const form = useForm<SearchUserValues>({
    resolver: zodResolver(searchUserSchema),
    defaultValues: { query: "" },
  });

  const queryWatch = form.watch("query");

  useEffect(() => {
    const trimmed = (queryWatch || "").trim();
    if (!trimmed) {
      setSearchResults([]);
      setIsSearchActive(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        setIsSearchActive(true);
        const res = await chatApi.searchUsers(trimmed);
        setSearchResults(res.users);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [queryWatch]);

  const handleStartChatWithUser = async (targetUser: ChatUser) => {
    try {
      setIsSearching(true);
      const res = await chatApi.createOrOpenConversation({ userId: targetUser.id });
      onSelect(res.conversation.id);
      form.reset();
      setIsSearchActive(false);
      setSearchResults([]);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = async (values: SearchUserValues) => {
    try {
      setIsSearching(true);
      const res = await chatApi.createOrOpenConversation({ email: values.query });
      onSelect(res.conversation.id);
      form.reset();
      setIsSearchActive(false);
      setSearchResults([]);
    } catch (err) {
      toast.error(extractApiError(err));
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    form.reset();
    setIsSearchActive(false);
    setSearchResults([]);
  };

  return (
    <div className={`flex flex-col bg-[#0A0C0B] h-full ${className}`}>
      {/* Search Header */}
      <div className="p-4 border-b border-[#BEB0A7]/10">
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6A7B76]" />
          <input
            {...form.register("query")}
            placeholder="Search users by email or username..."
            className="w-full rounded-xl border border-[#BEB0A7]/15 bg-[#040303] py-2.5 pl-10 pr-9 text-xs text-white placeholder:text-[#BEB0A7]/40 outline-none transition-all duration-200 focus:border-[#8B9D83] focus:ring-2 focus:ring-[#8B9D83]/20"
          />
          {isSearching ? (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-[#8B9D83]" />
          ) : queryWatch ? (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A7B76] hover:text-white"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </form>
      </div>

      {/* Conversation / Search Results List */}
      <div className="flex-1 overflow-y-auto p-3">
        {isSearchActive ? (
          <div>
            <div className="px-2 py-1.5 mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#6A7B76]">
              Search Results ({searchResults.length})
            </div>
            {searchResults.length === 0 && !isSearching ? (
              <div className="p-6 text-center text-xs text-[#6A7B76]">
                No users found matching "{queryWatch}"
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleStartChatWithUser(user)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 cursor-pointer border border-transparent hover:bg-[#101413] hover:border-[#BEB0A7]/10 group"
                  >
                    <div className="relative">
                      <Avatar className="size-10 border border-[#BEB0A7]/20 shadow-sm">
                        <AvatarImage src={user.avatarUrl || ""} alt={user.name} />
                        <AvatarFallback className="bg-[#3A4E48] text-white text-xs font-bold">
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.isOnline && (
                        <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-[#0A0C0B] bg-[#8B9D83]" />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate font-semibold text-sm text-white group-hover:text-[#8B9D83] transition-colors">
                        {user.name}
                      </span>
                      <span className="truncate text-xs text-[#6A7B76]">
                        @{user.username} • {user.email}
                      </span>
                    </div>
                    <UserCheck className="size-4 text-[#8B9D83] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : isLoading ? (
          <SidebarSkeleton />
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center h-full">
            <div className="size-12 rounded-2xl bg-[#3A4E48]/20 border border-[#8B9D83]/20 grid place-items-center mb-3">
              <UserPlus className="size-6 text-[#8B9D83]" />
            </div>
            <p className="text-sm font-semibold text-white">No active chats</p>
            <p className="mt-1 text-xs text-[#6A7B76] max-w-[200px]">
              Search by email or username above to start messaging.
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
