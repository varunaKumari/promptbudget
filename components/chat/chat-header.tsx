"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Download,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatbot } from "./chatbot-provider";

export function ChatHeader() {
  const {
    setIsOpen,
    status,
    startNewConversation,
    deleteConversation,
    exportConversation,
    regenerateLastResponse,
    searchQuery,
    setSearchQuery,
    messages,
  } = useChatbot();

  return (
    <header className="border-b border-border/65 bg-card/82 px-4 py-3.5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[0_12px_28px_oklch(84.1%_0.238_128.85_/_20%),0_0_0_1px_oklch(0_0_0_/_8%)]">
            <Sparkles className="h-4 w-4" />
            <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-success" />
          </div>
          <div>
            <h2 className="text-[0.92rem] font-semibold leading-tight">PromptBudget Assistant</h2>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              {status === "streaming" ? "Thinking through your spend" : "Online"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Regenerate last response"
                title="Regenerate"
                onClick={regenerateLastResponse}
                disabled={status === "streaming"}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Export conversation"
                title="Export"
                onClick={exportConversation}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Delete conversation"
                title="Delete"
                onClick={deleteConversation}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Start new chat"
                title="New chat"
                onClick={startNewConversation}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Minimize chat"
            title="Minimize"
            onClick={() => setIsOpen(false)}
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {messages.length > 0 && (
          <motion.div
            className="mt-3 flex items-center gap-2 rounded-lg border border-border/75 bg-background/76 px-2 shadow-inner"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 36 }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search this chat..."
              className="h-9 flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
