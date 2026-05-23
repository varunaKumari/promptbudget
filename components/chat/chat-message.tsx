"use client";

import { memo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Bot,
  Check,
  Copy,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownMessage } from "./markdown-message";
import { useChatbot } from "./chatbot-provider";
import type { ChatMessage as ChatMessageType } from "./types";
import { cn } from "@/lib/utils";

function ChatMessageBase({ message }: { message: ChatMessageType }) {
  const { retryMessage, submitFeedback } = useChatbot();
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";
  const isError = message.status === "error";

  const copyMessage = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <motion.div
      className={cn("group/message flex gap-2.5", isUser && "justify-end")}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {!isUser && <Avatar role="assistant" />}
      <div className={cn("max-w-[84%]", isUser && "order-first")}>
        <div
          className={cn(
            "rounded-xl px-3.5 py-3 text-sm leading-relaxed shadow-sm transition-shadow group-hover/message:shadow-md",
            isUser
              ? "rounded-br-md bg-primary text-primary-foreground shadow-[0_10px_28px_oklch(84.1%_0.238_128.85_/_16%)]"
              : "rounded-bl-md border border-border/70 bg-surface-elevated/90 text-foreground",
            isError && "border-danger/30 bg-danger/10 text-foreground shadow-none"
          )}
        >
          {isError && (
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-danger">
              <AlertCircle className="h-3.5 w-3.5" />
              Message failed
            </div>
          )}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {message.attachments.map((attachment) => (
                <span
                  key={attachment.id}
                  className={cn(
                "inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px]",
                    isUser
                      ? "border-primary-foreground/20 bg-primary-foreground/12"
                      : "border-border bg-muted"
                  )}
                >
                  {attachment.kind === "image" ? (
                    <ImageIcon className="h-3 w-3" />
                  ) : (
                    <FileText className="h-3 w-3" />
                  )}
                  <span className="max-w-[160px] truncate">{attachment.name}</span>
                </span>
              ))}
            </div>
          )}
          <MarkdownMessage content={message.content || " "} isUser={isUser} />
          {isError && message.retryContent && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 h-7 rounded-md bg-background/70 px-2 text-xs"
              onClick={() =>
                retryMessage(
                  message.retryContent || "",
                  message.retryAttachments || message.attachments || []
                )
              }
            >
              <RotateCcw className="h-3 w-3" />
              Retry
            </Button>
          )}
        </div>
        <div className={cn("mt-1.5 flex items-center gap-1 px-1", isUser && "justify-end")}>
          <span className="text-[10px] text-muted-foreground">
            {formatTime(message.createdAt)}
            {message.status === "sending" && " - sending"}
            {message.status === "streaming" && " - typing"}
          </span>
          {message.status !== "streaming" && message.status !== "sending" && (
            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover/message:opacity-100 focus-within:opacity-100">
              <button
                type="button"
                aria-label="Copy message"
                onClick={copyMessage}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </button>
              {!isUser && !isError && (
                <>
                  <button
                    type="button"
                    aria-label="Like response"
                    onClick={() => void submitFeedback(message.id, "like")}
                    className={cn(
                      "rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      message.feedback === "like" && "text-success"
                    )}
                  >
                    <ThumbsUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    aria-label="Dislike response"
                    onClick={() => void submitFeedback(message.id, "dislike")}
                    className={cn(
                      "rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      message.feedback === "dislike" && "text-danger"
                    )}
                  >
                    <ThumbsDown className="h-3 w-3" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {isUser && <Avatar role="user" />}
    </motion.div>
  );
}

export const ChatMessage = memo(ChatMessageBase);

function Avatar({ role }: { role: "assistant" | "user" }) {
  const isAssistant = role === "assistant";

  return (
    <div
      className={cn(
        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-sm",
        isAssistant
          ? "border-primary/30 bg-primary/15 text-primary"
          : "border-border bg-muted text-muted-foreground"
      )}
    >
      {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
    </div>
  );
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
