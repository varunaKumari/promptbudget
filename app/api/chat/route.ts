// ============================================================
// POST /api/chat - Streaming AI assistant for PromptBudget
// Persists conversation history when Supabase chat tables exist.
// ============================================================

import { streamText } from "ai";
import { NextRequest } from "next/server";
import { buildChatMessages } from "@/lib/ai/context";
import { buildSystemPrompt } from "@/lib/ai/prompts";
import { getChatModel, getChatModelId } from "@/lib/ai/provider";
import { chatRequestSchema } from "@/lib/ai/schemas";
import { resolveChatIdentity } from "@/lib/chat/auth";
import {
  fetchAuditForChat,
  getOrCreateConversation,
  getRecentMessages,
  saveChatMessage,
} from "@/lib/chat/conversations";
import { trackChatEvent } from "@/lib/chat/monitoring";
import { retrieveRelevantMemories, saveTurnMemory } from "@/lib/chat/memory";
import {
  assertAllowedOrigin,
  ChatHttpError,
  enforceRateLimit,
  getGuardContext,
  jsonError,
  parseJsonBody,
  parseOrThrow,
  withSecurityHeaders,
} from "@/lib/chat/security";
import {
  buildChatSessionCookie,
  createChatSessionId,
  getChatSessionId,
} from "@/lib/chat/session";
import {
  buildUserContext,
  updateUserProfileFromTurn,
} from "@/lib/chat/user-context";

export const runtime = "nodejs";
export const maxDuration = 60;

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const guard = getGuardContext(request);
  const startedAt = Date.now();

  try {
    assertAllowedOrigin(request);
    enforceRateLimit({
      key: `chat:ip:${guard.ip}`,
      limit: RATE_LIMIT,
      windowMs: RATE_WINDOW_MS,
      requestId,
    });

    const body = parseOrThrow(chatRequestSchema, await parseJsonBody(request));
    const anonymousSessionId = getChatSessionId(request) || createChatSessionId();
    const identity = await resolveChatIdentity({ request, requestId });
    enforceRateLimit({
      key: `chat:owner:${identity.userId || anonymousSessionId}`,
      limit: identity.userId ? 60 : 30,
      windowMs: RATE_WINDOW_MS,
      requestId,
    });

    const conversation = await getOrCreateConversation({
      conversationId: body.conversationId,
      anonymousSessionId,
      userId: identity.userId,
      auditId: body.auditId,
      requestId,
    });

    const [audit, recentMessages] = await Promise.all([
      fetchAuditForChat({ auditId: body.auditId, requestId }),
      getRecentMessages({
        conversationId: conversation.conversationId,
        anonymousSessionId,
        userId: identity.userId,
        requestId,
      }),
    ]);

    const user = await buildUserContext({
      identity,
      anonymousSessionId,
      audit,
      requestId,
    });

    const memories = await retrieveRelevantMemories({
      user,
      anonymousSessionId,
      query: body.message,
      auditId: body.auditId,
      requestId,
    });

    await saveChatMessage({
      conversationId: conversation.conversationId,
      role: "user",
      content: body.message,
      metadata: {
        requestId,
        auditId: body.auditId || null,
        pagePath: body.pagePath || null,
        attachments:
          body.attachments?.map((attachment) => ({
            id: attachment.id,
            name: attachment.name,
            mediaType: attachment.mediaType,
            size: attachment.size,
            kind: attachment.kind,
            hasExtractedText: !!attachment.extractedText,
            hasDataUrl: !!attachment.dataUrl,
          })) || [],
      },
      requestId,
    });

    const modelId = getChatModelId();
    const messages = buildChatMessages({
      audit,
      pagePath: body.pagePath,
      pageTitle: body.clientContext?.pageTitle,
      user,
      memories,
      recentMessages,
      userMessage: body.message,
      attachments: body.attachments || [],
    });

    trackChatEvent({
      level: "info",
      event: "stream_start",
      route: "/api/chat",
      requestId,
      metadata: {
        conversationId: conversation.conversationId,
        auditId: body.auditId,
        model: modelId,
        memoryCount: memories.length,
        userSource: user.source,
      },
    });

    const result = streamText({
      model: getChatModel(),
      system: buildSystemPrompt(),
      messages,
      maxOutputTokens: 700,
      temperature: 0.4,
      maxRetries: 2,
      onFinish: async (event) => {
        await saveChatMessage({
          conversationId: conversation.conversationId,
          role: "assistant",
          content: event.text,
          model: modelId,
          tokenCount:
            (event.totalUsage.inputTokens || 0) +
            (event.totalUsage.outputTokens || 0),
          metadata: {
            requestId,
            auditId: body.auditId || null,
            finishReason: event.finishReason,
            latencyMs: Date.now() - startedAt,
            inputTokens: event.totalUsage.inputTokens || null,
            outputTokens: event.totalUsage.outputTokens || null,
          },
          requestId,
        });

        void Promise.all([
          updateUserProfileFromTurn({
            user,
            anonymousSessionId,
            audit,
            requestId,
          }),
          saveTurnMemory({
            user,
            anonymousSessionId,
            conversationId: conversation.conversationId,
            userMessage: body.message,
            assistantMessage: event.text,
            audit,
            requestId,
          }),
        ]);

        trackChatEvent({
          level: "info",
          event: "stream_finish",
          route: "/api/chat",
          requestId,
          latencyMs: Date.now() - startedAt,
          metadata: {
            conversationId: conversation.conversationId,
            finishReason: event.finishReason,
          },
        });
      },
      onError: (error) => {
        trackChatEvent({
          level: "error",
          event: "stream_error",
          route: "/api/chat",
          requestId,
          error,
          metadata: {
            conversationId: conversation.conversationId,
          },
        });
      },
    });

    const response = result.toTextStreamResponse({
      headers: {
        "x-conversation-id": conversation.conversationId,
        "x-request-id": requestId,
      },
    });

    response.headers.append(
      "Set-Cookie",
      buildChatSessionCookie(anonymousSessionId)
    );

    return withSecurityHeaders(response);
  } catch (err) {
    trackChatEvent({
      level: "error",
      event: "request_failed",
      route: "/api/chat",
      requestId,
      latencyMs: Date.now() - startedAt,
      error: err,
    });

    if (err instanceof ChatHttpError) {
      return jsonError(err.message, err.status, err.headers);
    }

    const isConfigError =
      err instanceof Error && err.message.includes("OPENAI_API_KEY");

    return jsonError(
      isConfigError
        ? "AI chat is not configured yet."
        : "The assistant is unavailable right now. Please try again.",
      isConfigError ? 503 : 500
    );
  }
}
