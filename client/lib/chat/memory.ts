import { embed } from "ai";
import { getEmbeddingModel, getEmbeddingModelId } from "@/lib/ai/provider";
import type { ChatMemory, ChatUserContext } from "@/lib/ai/types";
import type { AuditResult } from "@/lib/types";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { chatLogger } from "./logging";

const MAX_RETRIEVED_MEMORIES = 8;
const MAX_MEMORY_CANDIDATES_PER_TURN = 2;

export async function retrieveRelevantMemories({
  user,
  anonymousSessionId,
  query,
  auditId,
  requestId,
}: {
  user: ChatUserContext;
  anonymousSessionId: string;
  query: string;
  auditId?: string;
  requestId: string;
}): Promise<ChatMemory[]> {
  if (!isSupabaseConfigured) return [];

  const vectorMemories = await retrieveByVector({
    user,
    anonymousSessionId,
    query,
    auditId,
    requestId,
  });

  if (vectorMemories.length > 0) return vectorMemories;

  return retrieveByKeyword({
    user,
    anonymousSessionId,
    query,
    auditId,
    requestId,
  });
}

export async function saveTurnMemory({
  user,
  anonymousSessionId,
  conversationId,
  userMessage,
  assistantMessage,
  audit,
  requestId,
}: {
  user: ChatUserContext;
  anonymousSessionId: string;
  conversationId: string;
  userMessage: string;
  assistantMessage: string;
  audit?: AuditResult;
  requestId: string;
}) {
  if (!isSupabaseConfigured) return;

  const memories = buildMemoryCandidates({
    userMessage,
    assistantMessage,
    audit,
  });

  for (const memory of memories.slice(0, MAX_MEMORY_CANDIDATES_PER_TURN)) {
    await saveMemory({
      user,
      anonymousSessionId,
      conversationId,
      content: memory.content,
      kind: memory.kind,
      importance: memory.importance,
      metadata: memory.metadata,
      requestId,
    });
  }
}

async function retrieveByVector({
  user,
  anonymousSessionId,
  query,
  auditId,
  requestId,
}: {
  user: ChatUserContext;
  anonymousSessionId: string;
  query: string;
  auditId?: string;
  requestId: string;
}): Promise<ChatMemory[]> {
  try {
    const { embedding } = await embed({
      model: getEmbeddingModel(),
      value: query.slice(0, 1200),
    });

    const { data, error } = await supabaseAdmin.rpc("match_chat_memories", {
      query_embedding: embedding,
      match_count: MAX_RETRIEVED_MEMORIES,
      min_similarity: 0.72,
      owner_user_id: user.userId || null,
      owner_anonymous_session_id: user.userId ? null : anonymousSessionId,
      active_audit_id: auditId || null,
    });

    if (error) {
      chatLogger.warn("memory_vector_retrieval_failed", {
        requestId,
        message: error.message,
      });
      return [];
    }

    return mapMemoryRows(data || []);
  } catch (err) {
    chatLogger.warn("memory_embedding_retrieval_failed", {
      requestId,
      message: err instanceof Error ? err.message : String(err),
    });
    return [];
  }
}

async function retrieveByKeyword({
  user,
  anonymousSessionId,
  query,
  auditId,
  requestId,
}: {
  user: ChatUserContext;
  anonymousSessionId: string;
  query: string;
  auditId?: string;
  requestId: string;
}): Promise<ChatMemory[]> {
  const terms = query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((term) => term.length > 3)
    .slice(0, 6);

  let dbQuery = supabaseAdmin
    .from("chat_memories")
    .select("id, kind, content, importance, metadata, created_at, last_seen_at")
    .eq("status", "active")
    .order("importance", { ascending: false })
    .order("last_seen_at", { ascending: false })
    .limit(MAX_RETRIEVED_MEMORIES);

  dbQuery = user.userId
    ? dbQuery.eq("user_id", user.userId)
    : dbQuery.eq("anonymous_session_id", anonymousSessionId);

  if (auditId) {
    dbQuery = dbQuery.or(`audit_id.eq.${auditId},audit_id.is.null`);
  }

  if (terms.length > 0) {
    dbQuery = dbQuery.or(terms.map((term) => `content.ilike.%${term}%`).join(","));
  }

  const { data, error } = await dbQuery;

  if (error) {
    chatLogger.warn("memory_keyword_retrieval_failed", {
      requestId,
      message: error.message,
    });
    return [];
  }

  return mapMemoryRows(data || []);
}

async function saveMemory({
  user,
  anonymousSessionId,
  conversationId,
  content,
  kind,
  importance,
  metadata,
  requestId,
}: {
  user: ChatUserContext;
  anonymousSessionId: string;
  conversationId: string;
  content: string;
  kind: ChatMemory["kind"];
  importance: number;
  metadata: Record<string, unknown>;
  requestId: string;
}) {
  if (content.length < 20) return;

  let embedding: number[] | null = null;

  try {
    const result = await embed({
      model: getEmbeddingModel(),
      value: content,
    });
    embedding = result.embedding;
  } catch (err) {
    chatLogger.warn("memory_embedding_save_failed", {
      requestId,
      message: err instanceof Error ? err.message : String(err),
    });
  }

  const { error } = await supabaseAdmin.from("chat_memories").insert({
    user_id: user.userId || null,
    anonymous_session_id: user.userId ? null : anonymousSessionId,
    conversation_id: conversationId,
    audit_id: typeof metadata.auditId === "string" ? metadata.auditId : null,
    kind,
    content,
    importance,
    embedding,
    embedding_model: embedding ? getEmbeddingModelId() : null,
    metadata,
  });

  if (error) {
    chatLogger.warn("memory_insert_failed", {
      requestId,
      message: error.message,
    });
  }
}

function buildMemoryCandidates({
  userMessage,
  assistantMessage,
  audit,
}: {
  userMessage: string;
  assistantMessage: string;
  audit?: AuditResult;
}): Array<{
  kind: ChatMemory["kind"];
  content: string;
  importance: number;
  metadata: Record<string, unknown>;
}> {
  const candidates: Array<{
    kind: ChatMemory["kind"];
    content: string;
    importance: number;
    metadata: Record<string, unknown>;
  }> = [];

  if (audit) {
    candidates.push({
      kind: "audit_insight",
      content: `User audited ${audit.toolResults.length} AI tools for a ${audit.inputData.teamSize}-person team focused on ${audit.inputData.primaryUseCase}. Current spend is $${audit.totalCurrentMonthlySpend}/mo with estimated savings of $${audit.totalMonthlySavings}/mo.`,
      importance: audit.totalMonthlySavings >= 500 ? 9 : 7,
      metadata: {
        auditId: audit.id || null,
        teamSize: audit.inputData.teamSize,
        primaryUseCase: audit.inputData.primaryUseCase,
        monthlySavings: audit.totalMonthlySavings,
      },
    });
  }

  if (/\b(cfo|finance|budget|procurement|founder|engineering manager|cto)\b/i.test(userMessage)) {
    candidates.push({
      kind: "business_context",
      content: `User asked in a business-planning context: "${userMessage.slice(0, 240)}"`,
      importance: 6,
      metadata: { source: "user_message" },
    });
  }

  if (/\b(prefer|don't|do not|always|usually|my team|we use|we have)\b/i.test(userMessage)) {
    candidates.push({
      kind: "preference",
      content: `User preference or operating context: "${userMessage.slice(0, 260)}"`,
      importance: 6,
      metadata: { source: "user_message" },
    });
  }

  if (assistantMessage.length > 80) {
    candidates.push({
      kind: "session_summary",
      content: `Recent assistant guidance: ${assistantMessage.slice(0, 420)}`,
      importance: 4,
      metadata: { source: "assistant_message" },
    });
  }

  return dedupeCandidates(candidates);
}

function dedupeCandidates<T extends { content: string }>(candidates: T[]): T[] {
  const seen = new Set<string>();
  return candidates.filter((candidate) => {
    const key = candidate.content.toLowerCase().slice(0, 160);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function mapMemoryRows(rows: Array<Record<string, unknown>>): ChatMemory[] {
  return rows.map((row) => ({
    id: String(row.id),
    kind: row.kind as ChatMemory["kind"],
    content: String(row.content),
    importance: Number(row.importance || 0),
    createdAt: typeof row.created_at === "string" ? row.created_at : undefined,
    lastSeenAt: typeof row.last_seen_at === "string" ? row.last_seen_at : undefined,
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
  }));
}
