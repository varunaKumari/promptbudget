"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChatMessage } from "./chat-message";
import { ChatSuggestions } from "./chat-suggestions";
import { TypingIndicator } from "./typing-indicator";
import { useChatbot } from "./chatbot-provider";

export function ChatThread() {
  const { messages, visibleMessages, hiddenMessageCount, searchQuery, status } = useChatbot();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  return (
    <div
      className="chat-scrollbar min-h-0 flex-1 overflow-y-auto bg-background/18 px-4 py-4"
      aria-live={status === "streaming" ? "polite" : "off"}
      aria-relevant="additions text"
    >
      {messages.length === 0 ? (
        <ChatSuggestions />
      ) : visibleMessages.length === 0 ? (
        <div className="flex min-h-full items-center justify-center text-center">
          <div>
            <p className="text-sm font-medium">No matching messages</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Try a different search for &quot;{searchQuery}&quot;.
            </p>
          </div>
        </div>
      ) : (
        <motion.div className="space-y-4" initial={false}>
          {hiddenMessageCount > 0 && (
            <div className="rounded-md border border-border bg-muted/45 px-3 py-2 text-center text-xs text-muted-foreground">
              Showing the latest {visibleMessages.length} messages. Use search to find older messages.
            </div>
          )}
          {visibleMessages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {status === "streaming" && messages.at(-1)?.content === "" && (
            <TypingIndicator />
          )}
        </motion.div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
