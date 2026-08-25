import type { AuditResult } from "@/lib/types";

export type ChatRole = "user" | "assistant" | "system" | "tool";

export interface ChatAttachment {
  id: string;
  name: string;
  mediaType: string;
  size: number;
  kind: "image" | "text" | "file";
  dataUrl?: string;
  extractedText?: string;
}

export interface StoredChatMessage {
  id?: string;
  role: ChatRole;
  content: string;
  createdAt?: string;
  metadata?: Record<string, unknown>;
}

export interface ChatUserContext {
  userId?: string;
  email?: string;
  displayName?: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  preferences: Record<string, unknown>;
  traits: Record<string, unknown>;
  source: "authenticated" | "anonymous";
}

export interface ChatMemory {
  id: string;
  kind: "profile" | "preference" | "business_context" | "audit_insight" | "recommendation" | "session_summary";
  content: string;
  importance: number;
  createdAt?: string;
  lastSeenAt?: string;
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
