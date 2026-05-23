"use client";

import { Suspense, createContext, lazy, useContext } from "react";
import { AnimatePresence } from "framer-motion";
import { ChatErrorBoundary } from "./chat-error-boundary";
import { FloatingChatButton } from "./floating-chat-button";
import { useChatWidget } from "@/hooks/use-chat-widget";

type ChatbotContextValue = ReturnType<typeof useChatWidget>;

const ChatbotContext = createContext<ChatbotContextValue | null>(null);
const LazyChatWindow = lazy(() =>
  import("./chat-window").then((module) => ({ default: module.ChatWindow }))
);

export function useChatbot() {
  const context = useContext(ChatbotContext);
  if (!context) {
    throw new Error("useChatbot must be used within ChatbotProvider");
  }
  return context;
}

export function ChatbotProvider() {
  const chat = useChatWidget();

  return (
    <ChatbotContext.Provider value={chat}>
      <ChatErrorBoundary>
        <FloatingChatButton />
        <AnimatePresence>
          {chat.isOpen && (
            <Suspense fallback={null}>
              <LazyChatWindow />
            </Suspense>
          )}
        </AnimatePresence>
      </ChatErrorBoundary>
    </ChatbotContext.Provider>
  );
}
