import type { ModelMessage, UserContent } from "ai";
import { buildContextPrompt } from "./prompts";
import type {
  ChatAttachment,
  ChatMemory,
  ChatUserContext,
  StoredChatMessage,
} from "./types";
import type { AuditResult } from "@/lib/types";

export function buildChatMessages({
  audit,
  pagePath,
  pageTitle,
  user,
  memories,
  recentMessages,
  userMessage,
  attachments = [],
}: {
  audit?: AuditResult;
  pagePath?: string;
  pageTitle?: string;
  user?: ChatUserContext;
  memories: ChatMemory[];
  recentMessages: StoredChatMessage[];
  userMessage: string;
  attachments?: ChatAttachment[];
}): ModelMessage[] {
  return [
    {
      role: "user",
      content: buildContextPrompt({
        audit,
        pagePath,
        pageTitle,
        user,
        memories,
      }),
    },
    ...recentMessages.map((message) => ({
      role: message.role as "user" | "assistant",
      content: trimForContext(message.content),
    })),
    {
      role: "user",
      content: buildUserContent(userMessage, attachments),
    },
  ];
}

export function summarizeAttachments(attachments: ChatAttachment[] = []): string {
  if (attachments.length === 0) return "";

  return attachments
    .map((attachment) => {
      const text = attachment.extractedText
        ? `\nExtracted text:\n${attachment.extractedText.slice(0, 6000)}`
        : "";
      return `Attachment: ${attachment.name} (${attachment.mediaType}, ${Math.round(
        attachment.size / 1024
      )} KB, ${attachment.kind})${text}`;
    })
    .join("\n\n");
}

function buildUserContent(
  userMessage: string,
  attachments: ChatAttachment[]
): UserContent {
  if (attachments.length === 0) return userMessage;

  const parts: UserContent = [
    {
      type: "text",
      text: [userMessage, summarizeAttachments(attachments)].filter(Boolean).join("\n\n"),
    },
  ];

  for (const attachment of attachments) {
    if (attachment.kind !== "image" || !attachment.dataUrl) continue;

    const base64 = attachment.dataUrl.split(",")[1];
    if (!base64) continue;

    parts.push({
      type: "image",
      image: base64,
      mediaType: attachment.mediaType,
    });
  }

  return parts;
}

function trimForContext(content: string): string {
  return content.length > 1200 ? `${content.slice(0, 1200)}...` : content;
}
