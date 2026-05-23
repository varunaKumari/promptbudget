"use client";

import { motion } from "framer-motion";
import { ChatHeader } from "./chat-header";
import { ChatThread } from "./chat-thread";
import { ChatComposer } from "./chat-composer";
import { useChatbot } from "./chatbot-provider";

export function ChatWindow() {
  const { messages, status } = useChatbot();

  return (
    <motion.section
      role="dialog"
      aria-label="PromptBudget assistant"
      className="fixed inset-x-2 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-50 flex h-[min(720px,calc(100dvh-6.5rem))] overflow-hidden rounded-xl border border-border/65 bg-card/96 shadow-[0_28px_100px_oklch(0_0_0_/_24%),0_1px_0_oklch(1_0_0_/_45%)_inset] backdrop-blur-2xl sm:inset-x-3 md:inset-x-auto md:bottom-24 md:right-6 md:w-[440px]"
      initial={{ opacity: 0, y: 28, scale: 0.95, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: 20, scale: 0.96, filter: "blur(4px)" }}
      transition={{ type: "spring", stiffness: 360, damping: 32 }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-80 chat-surface-shine" />
      <div className="relative flex min-h-0 w-full flex-col">
        <ChatHeader />
        {status === "loading" && messages.length === 0 ? (
          <div className="flex-1 space-y-4 overflow-hidden p-5">
            <div className="flex items-start gap-2.5">
              <div className="skeleton h-8 w-8 rounded-lg" />
              <div className="skeleton h-16 w-4/5 rounded-lg" />
            </div>
            <div className="ml-auto skeleton h-12 w-2/3 rounded-lg" />
            <div className="flex items-start gap-2.5">
              <div className="skeleton h-8 w-8 rounded-lg" />
              <div className="skeleton h-24 w-[86%] rounded-lg" />
            </div>
          </div>
        ) : (
          <ChatThread />
        )}
        <ChatComposer />
      </div>
    </motion.section>
  );
}
