import { MessagesSquare } from "lucide-react";

export function EmptyConversationState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-8">
      <div className="grid size-16 place-items-center rounded-2xl bg-white/5 border border-white/10 mb-6">
        <MessagesSquare className="size-8 text-white/40" />
      </div>
      <h3 className="text-xl font-medium tracking-tight mb-2">No conversation selected</h3>
      <p className="text-white/50 max-w-sm text-sm">
        Choose a conversation from the sidebar or search for a user by email to start chatting.
      </p>
    </div>
  );
}
