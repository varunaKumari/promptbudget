import type { AuditResult } from "@/lib/types";

export type ChatRole = "user" | "assistant" | "system" | "tool";

export interface StoredChatMessage {
  id?: string;
  role: ChatRole;
  content: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatRequestContext {
  conversationId?: string;
  auditId?: string;
  pagePath?: string;
  clientContext?: {
    pageTitle?: string;
    selectedToolId?: string;
  };
}

export interface ChatContextBundle {
  conversationId: string;
  anonymousSessionId: string;
  audit?: AuditResult;
  recentMessages: StoredChatMessage[];
  pagePath?: string;
  pageTitle?: string;
}

export interface ChatPersistenceResult {
  conversationId: string;
  created: boolean;
}
