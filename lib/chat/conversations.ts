import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import type { AuditResult } from "@/lib/types";
import type {
  ChatPersistenceResult,
  ChatRole,
  StoredChatMessage,
} from "@/lib/ai/types";
import { getCached, setCached } from "./cache";
import { chatLogger } from "./logging";
import { withRetry } from "./retry";

const MAX_HISTORY_MESSAGES = 10;
const MAX_STORED_MESSAGES = 100;
const AUDIT_CACHE_TTL_MS = 60 * 1000;

export async function getOrCreateConversation({
  conversationId,
  anonymousSessionId,
  userId,
  auditId,
  requestId,
}: {
  conversationId?: string;
  anonymousSessionId: string;
  userId?: string;
  auditId?: string;
  requestId: string;
}): Promise<ChatPersistenceResult> {
  if (!isSupabaseConfigured) {
    return {
      conversationId: conversationId || crypto.randomUUID(),
      created: !conversationId,
    };
  }

  if (conversationId) {
    let query = supabaseAdmin
      .from("chat_conversations")
      .select("id")
      .eq("id", conversationId)
      .neq("status", "deleted");

    query = userId
      ? query.eq("user_id", userId)
      : query.eq("anonymous_session_id", anonymousSessionId);

    const { data, error } = await withRetry({
      operation: async () => await query.maybeSingle(),
    });

    if (error) {
      chatLogger.warn("conversation_lookup_failed", {
        requestId,
        conversationId,
        message: error.message,
      });
    }

    if (data?.id) {
      return { conversationId: data.id, created: false };
    }
  }

  const { data, error } = await withRetry({
    operation: async () =>
      await supabaseAdmin
        .from("chat_conversations")
        .insert({
          user_id: userId || null,
          anonymous_session_id: anonymousSessionId,
          audit_id: auditId || null,
          metadata: {},
        })
        .select("id")
        .single(),
  });

  if (error || !data?.id) {
    chatLogger.warn("conversation_create_failed", {
      requestId,
      message: error?.message,
    });

    return {
      conversationId: conversationId || crypto.randomUUID(),
      created: true,
    };
  }

  return { conversationId: data.id, created: true };
}

export async function getRecentMessages({
  conversationId,
  anonymousSessionId,
  userId,
  requestId,
}: {
  conversationId: string;
  anonymousSessionId: string;
  userId?: string;
  requestId: string;
}): Promise<StoredChatMessage[]> {
  if (!isSupabaseConfigured) return [];

  let conversationQuery = supabaseAdmin
    .from("chat_conversations")
    .select("id")
    .eq("id", conversationId);

  conversationQuery = userId
    ? conversationQuery.eq("user_id", userId)
    : conversationQuery.eq("anonymous_session_id", anonymousSessionId);

  const { data: conversation } = await conversationQuery.maybeSingle();

  if (!conversation) return [];

  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .select("id, role, content, created_at, metadata")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(MAX_HISTORY_MESSAGES);

  if (error) {
    chatLogger.warn("messages_fetch_failed", {
      requestId,
      conversationId,
      message: error.message,
    });
    return [];
  }

  return (data || [])
    .reverse()
    .map((message) => ({
      id: message.id,
      role: message.role as ChatRole,
      content: message.content,
      createdAt: message.created_at,
      metadata: message.metadata || {},
    }))
    .filter((message) => message.role === "user" || message.role === "assistant");
}

export async function assertConversationAccess({
  conversationId,
  anonymousSessionId,
  userId,
}: {
  conversationId: string;
  anonymousSessionId: string;
  userId?: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  let query = supabaseAdmin
    .from("chat_conversations")
    .select("id")
    .eq("id", conversationId)
    .neq("status", "deleted");

  query = userId
    ? query.eq("user_id", userId)
    : query.eq("anonymous_session_id", anonymousSessionId);

  const { data, error } = await query.maybeSingle();
  return !error && !!data?.id;
}

export async function listConversations({
  anonymousSessionId,
  userId,
  requestId,
}: {
  anonymousSessionId: string;
  userId?: string;
  requestId: string;
}) {
  if (!isSupabaseConfigured) return [];

  let query = supabaseAdmin
    .from("chat_conversations")
    .select("id, audit_id, title, status, created_at, updated_at, metadata")
    .neq("status", "deleted")
    .order("updated_at", { ascending: false })
    .limit(20);

  query = userId
    ? query.eq("user_id", userId)
    : query.eq("anonymous_session_id", anonymousSessionId);

  const { data, error } = await query;

  if (error) {
    chatLogger.warn("conversations_list_failed", {
      requestId,
      message: error.message,
    });
    return [];
  }

  return data || [];
}

export async function getConversationMessages({
  conversationId,
  anonymousSessionId,
  userId,
  requestId,
}: {
  conversationId: string;
  anonymousSessionId: string;
  userId?: string;
  requestId: string;
}): Promise<StoredChatMessage[]> {
  if (!isSupabaseConfigured) return [];

  let conversationQuery = supabaseAdmin
    .from("chat_conversations")
    .select("id")
    .eq("id", conversationId)
    .neq("status", "deleted");

  conversationQuery = userId
    ? conversationQuery.eq("user_id", userId)
    : conversationQuery.eq("anonymous_session_id", anonymousSessionId);

  const { data: conversation } = await conversationQuery.maybeSingle();

  if (!conversation) return [];

  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .select("id, role, content, created_at, metadata")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(MAX_STORED_MESSAGES);

  if (error) {
    chatLogger.warn("conversation_messages_fetch_failed", {
      requestId,
      conversationId,
      message: error.message,
    });
    return [];
  }

  return (data || []).map((message) => ({
    id: message.id,
    role: message.role as ChatRole,
    content: message.content,
    createdAt: message.created_at,
    metadata: message.metadata || {},
  }));
}

export async function archiveConversation({
  conversationId,
  anonymousSessionId,
  userId,
  requestId,
}: {
  conversationId: string;
  anonymousSessionId: string;
  userId?: string;
  requestId: string;
}): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  let query = supabaseAdmin
    .from("chat_conversations")
    .update({ status: "deleted", updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  query = userId
    ? query.eq("user_id", userId)
    : query.eq("anonymous_session_id", anonymousSessionId);

  const { error } = await query;

  if (error) {
    chatLogger.warn("conversation_archive_failed", {
      requestId,
      conversationId,
      message: error.message,
    });
    return false;
  }

  return true;
}

export async function saveChatMessage({
  conversationId,
  role,
  content,
  model,
  tokenCount,
  metadata,
  requestId,
}: {
  conversationId: string;
  role: ChatRole;
  content: string;
  model?: string;
  tokenCount?: number;
  metadata?: Record<string, unknown>;
  requestId: string;
}) {
  if (!isSupabaseConfigured) return;
  if (!content.trim()) return;

  const { error } = await withRetry({
    operation: async () =>
      await supabaseAdmin.from("chat_messages").insert({
        conversation_id: conversationId,
        role,
        content,
        model: model || null,
        token_count: tokenCount || null,
        metadata: metadata || {},
      }),
  });

  if (error) {
    chatLogger.warn("message_save_failed", {
      requestId,
      conversationId,
      role,
      message: error.message,
    });
    return;
  }

  await supabaseAdmin
    .from("chat_conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);
}

export async function fetchAuditForChat({
  auditId,
  requestId,
}: {
  auditId?: string;
  requestId: string;
}): Promise<AuditResult | undefined> {
  if (!auditId || !isSupabaseConfigured) return undefined;
  const cacheKey = `audit:${auditId}`;
  const cached = getCached<AuditResult>(cacheKey);
  if (cached) return cached;

  const { data, error } = await supabaseAdmin
    .from("audits")
    .select("id, results, ai_summary, created_at")
    .eq("id", auditId)
    .maybeSingle();

  if (error) {
    chatLogger.warn("audit_fetch_failed", {
      requestId,
      auditId,
      message: error.message,
    });
    return undefined;
  }

  if (!data?.results) return undefined;

  const result = data.results as AuditResult;
  result.id = data.id;
  result.aiSummary = data.ai_summary || undefined;
  result.createdAt = data.created_at;

  return setCached(cacheKey, result, AUDIT_CACHE_TTL_MS);
}
