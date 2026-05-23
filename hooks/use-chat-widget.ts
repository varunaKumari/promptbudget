"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useDebouncedValue } from "./use-debounced-value";
import type {
  ChatAttachment,
  ChatFeedback,
  ChatMessage,
  StoredConversation,
} from "@/components/chat/types";

type ChatStatus = "idle" | "loading" | "streaming" | "error";
const MAX_RENDERED_MESSAGES = 80;

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

function createLocalMessage(
  role: ChatMessage["role"],
  content: string,
  status: ChatMessage["status"] = "sent",
  attachments: ChatAttachment[] = []
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    status,
    createdAt: new Date().toISOString(),
    attachments,
  };
}

function extractAuditId(pathname: string | null): string | undefined {
  const match = pathname?.match(/^\/results\/([^/?#]+)/);
  return match?.[1];
}

export function useChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const streamFrameRef = useRef<number | null>(null);
  const loadedRef = useRef(false);

  const auditId = useMemo(() => extractAuditId(pathname), [pathname]);
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 180);

  const loadLatestConversation = useCallback(async () => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    setStatus("loading");

    try {
      const res = await fetch("/api/chat/conversations", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = (await res.json()) as ApiResponse<{
        conversations: StoredConversation[];
      }>;

      if (!data.success) {
        setStatus("idle");
        return;
      }

      const latest = data.data?.conversations?.[0];
      if (!latest?.id) {
        setStatus("idle");
        return;
      }

      setConversationId(latest.id);

      const messageRes = await fetch(`/api/chat/conversations/${latest.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const messageData = (await messageRes.json()) as ApiResponse<{
        messages: Array<{
          id: string;
          role: "user" | "assistant";
          content: string;
          createdAt?: string;
          metadata?: Record<string, unknown>;
        }>;
      }>;

      if (messageData.success && messageData.data?.messages) {
        setMessages(
          messageData.data.messages
            .filter((message) => message.role === "user" || message.role === "assistant")
            .map((message) => ({
              id: message.id,
              role: message.role,
              content: message.content,
              createdAt: message.createdAt || new Date().toISOString(),
              status: "sent",
              attachments: parseStoredAttachments(message.metadata?.attachments),
              feedback:
                typeof message.metadata?.feedback === "string"
                  ? (message.metadata.feedback as ChatFeedback)
                  : undefined,
            }))
        );
      }
      setStatus("idle");
    } catch {
      setStatus("idle");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = window.setTimeout(() => {
        void loadLatestConversation();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [isOpen, loadLatestConversation]);

  const sendMessage = useCallback(
    async (
      contentOverride?: string,
      options?: { attachments?: ChatAttachment[]; skipOptimisticUser?: boolean }
    ) => {
      const content = (contentOverride ?? input).trim();
      const outgoingAttachments = options?.attachments ?? attachments;
      if ((!content && outgoingAttachments.length === 0) || status === "streaming") return;

      setInput("");
      setAttachments([]);
      setError("");
      setStatus("streaming");

      const userMessage = createLocalMessage(
        "user",
        content || "Analyze the attached file.",
        "sending",
        outgoingAttachments
      );
      const assistantMessage = createLocalMessage("assistant", "", "streaming");
      setMessages((prev) =>
        options?.skipOptimisticUser
          ? [...prev, assistantMessage]
          : [...prev, userMessage, assistantMessage]
      );

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            conversationId,
            auditId,
            message: content || "Analyze the attached file.",
            attachments: outgoingAttachments,
            pagePath: pathname || undefined,
            clientContext: {
              pageTitle: typeof document !== "undefined" ? document.title : undefined,
            },
          }),
        });

        const nextConversationId = res.headers.get("x-conversation-id");
        if (nextConversationId) setConversationId(nextConversationId);

        if (!res.ok || !res.body) {
          let message = "The assistant could not respond. Please try again.";
          try {
            const data = (await res.json()) as ApiResponse<unknown>;
            message = data.error || message;
          } catch {
            // Keep fallback message.
          }
          throw new Error(message);
        }

        setMessages((prev) =>
          prev.map((message) =>
            message.id === userMessage.id ? { ...message, status: "sent" } : message
          )
        );

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        const flushStream = () => {
          streamFrameRef.current = null;
          setMessages((prev) =>
            prev.map((message) =>
              message.id === assistantMessage.id
                ? { ...message, content: accumulated, status: "streaming" }
                : message
            )
          );
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });
          if (streamFrameRef.current === null) {
            streamFrameRef.current = window.requestAnimationFrame(flushStream);
          }
        }

        if (streamFrameRef.current !== null) {
          window.cancelAnimationFrame(streamFrameRef.current);
          streamFrameRef.current = null;
        }

        setMessages((prev) =>
          prev.map((message) =>
            message.id === assistantMessage.id
              ? { ...message, content: accumulated, status: "sent" }
              : message
          )
        );
        setStatus("idle");
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          setStatus("idle");
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "The assistant could not respond. Please try again.";
        setError(message);
        setStatus("error");
        setMessages((prev) =>
          prev.map((item) => {
            if (item.id === userMessage.id) return { ...item, status: "sent" };
            if (item.id === assistantMessage.id) {
              return {
                ...item,
                status: "error",
                content: message,
                retryContent: content || "Analyze the attached file.",
                retryAttachments: outgoingAttachments,
                attachments: outgoingAttachments,
              };
            }
            return item;
          })
        );
      } finally {
        abortRef.current = null;
      }
    },
    [attachments, auditId, conversationId, input, pathname, status]
  );

  const retryMessage = useCallback(
    (content: string, retryAttachments: ChatAttachment[] = []) => {
      setMessages((prev) => prev.filter((message) => message.status !== "error"));
      void sendMessage(content, { attachments: retryAttachments });
    },
    [sendMessage]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    if (streamFrameRef.current !== null) {
      window.cancelAnimationFrame(streamFrameRef.current);
      streamFrameRef.current = null;
    }
    setStatus("idle");
    setMessages((prev) =>
      prev.map((message) =>
        message.status === "streaming" ? { ...message, status: "sent" } : message
      )
    );
  }, []);

  const startNewConversation = useCallback(() => {
    abortRef.current?.abort();
    if (streamFrameRef.current !== null) {
      window.cancelAnimationFrame(streamFrameRef.current);
      streamFrameRef.current = null;
    }
    setConversationId(undefined);
    setMessages([]);
    setInput("");
    setAttachments([]);
    setError("");
    setStatus("idle");
  }, []);

  const deleteConversation = useCallback(async () => {
    if (!conversationId) {
      startNewConversation();
      return;
    }

    try {
      await fetch(`/api/chat/conversations/${conversationId}`, {
        method: "DELETE",
      });
    } finally {
      startNewConversation();
    }
  }, [conversationId, startNewConversation]);

  const exportConversation = useCallback(() => {
    const exported = {
      conversationId,
      exportedAt: new Date().toISOString(),
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
        attachments: message.attachments?.map(({ dataUrl, ...attachment }) => ({
          ...attachment,
          hasDataUrl: !!dataUrl,
        })),
        feedback: message.feedback,
      })),
    };

    const blob = new Blob([JSON.stringify(exported, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `promptbudget-chat-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [conversationId, messages]);

  const regenerateLastResponse = useCallback(() => {
    const lastUser = [...messages].reverse().find((message) => message.role === "user");
    if (!lastUser || status === "streaming") return;

    setMessages((prev) => {
      const lastAssistantIndex = [...prev]
        .map((message, index) => ({ message, index }))
        .reverse()
        .find((entry) => entry.message.role === "assistant")?.index;

      if (lastAssistantIndex === undefined) return prev;
      return prev.filter((_, index) => index !== lastAssistantIndex);
    });

    void sendMessage(lastUser.content, {
      attachments: lastUser.attachments || [],
      skipOptimisticUser: true,
    });
  }, [messages, sendMessage, status]);

  const submitFeedback = useCallback(
    async (messageId: string, rating: ChatFeedback) => {
      const target = messages.find((message) => message.id === messageId);
      if (!target || target.role !== "assistant") return;

      setMessages((prev) =>
        prev.map((message) =>
          message.id === messageId ? { ...message, feedback: rating } : message
        )
      );

      if (!conversationId) return;

      await fetch("/api/chat/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          messageId: isUuid(messageId) ? messageId : undefined,
          rating,
          content: target.content,
        }),
      }).catch(() => {
        // Feedback is useful telemetry, but it should never interrupt the chat.
      });
    },
    [conversationId, messages]
  );

  const filteredMessages = useMemo(() => {
    const query = debouncedSearchQuery.trim().toLowerCase();
    if (!query) return messages.slice(-MAX_RENDERED_MESSAGES);
    return messages.filter((message) =>
      `${message.content} ${message.attachments?.map((item) => item.name).join(" ") || ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [debouncedSearchQuery, messages]);

  const hiddenMessageCount = Math.max(
    0,
    debouncedSearchQuery.trim() ? 0 : messages.length - filteredMessages.length
  );

  return {
    isOpen,
    setIsOpen,
    conversationId,
    messages,
    visibleMessages: filteredMessages,
    hiddenMessageCount,
    input,
    setInput,
    attachments,
    setAttachments,
    searchQuery,
    setSearchQuery,
    status,
    error,
    auditId,
    sendMessage,
    retryMessage,
    stopStreaming,
    startNewConversation,
    deleteConversation,
    exportConversation,
    regenerateLastResponse,
    submitFeedback,
  };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function parseStoredAttachments(value: unknown): ChatAttachment[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const attachments = value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const attachment = item as Record<string, unknown>;
    const id = typeof attachment.id === "string" ? attachment.id : crypto.randomUUID();
    const name = typeof attachment.name === "string" ? attachment.name : "Attachment";
    const mediaType =
      typeof attachment.mediaType === "string"
        ? attachment.mediaType
        : "application/octet-stream";
    const size = typeof attachment.size === "number" ? attachment.size : 0;
    const kind =
      attachment.kind === "image" || attachment.kind === "text" || attachment.kind === "file"
        ? attachment.kind
        : "file";

    return [{ id, name, mediaType, size, kind } satisfies ChatAttachment];
  });

  return attachments.length > 0 ? attachments : undefined;
}
