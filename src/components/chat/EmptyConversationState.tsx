import { MessagesSquare } from "lucide-react";
import { motion } from "framer-motion";

export function EmptyConversationState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-8 bg-[#040303] select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <div className="grid size-16 place-items-center rounded-2xl bg-[#3A4E48]/20 border border-[#8B9D83]/20 shadow-xl shadow-[#040303]/60 mb-5">
          <MessagesSquare className="size-8 text-[#8B9D83]" />
        </div>
        <h3 className="text-lg font-bold tracking-tight text-white mb-1.5">No conversation selected</h3>
        <p className="text-[#6A7B76] max-w-xs text-xs leading-relaxed">
          Select an active chat from the sidebar or enter a user email to initiate a encrypted message thread.
        </p>
      </motion.div>
    </div>
  );
}
