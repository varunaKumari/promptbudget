// ============================================================
// POST /api/chat - Streaming AI assistant for PromptBudget
// Persists conversation history when Supabase chat tables exist.
// ============================================================

import { streamText, type ModelMessage } from "ai";
import { NextRequest } from "next/server";
import { buildContextPrompt, buildSystemPrompt } from "@/lib/ai/prompts";
import { getChatModel, getChatModelId } from "@/lib/ai/provider";
import { chatRequestSchema, formatZodError } from "@/lib/ai/schemas";
import {
  fetchAuditForChat,
  getOrCreateConversation,
  getRecentMessages,
  saveChatMessage,
} from "@/lib/chat/conversations";
import { chatLogger } from "@/lib/chat/logging";
import { checkRateLimit, getClientIp } from "@/lib/chat/rate-limit";
import {
  buildChatSessionCookie,
  createChatSessionId,
  getChatSessionId,
} from "@/lib/chat/session";
import type { ApiResponse } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const startedAt = Date.now();

  try {
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit({
      key: `chat:${ip}`,
      limit: RATE_LIMIT,
      windowMs: RATE_WINDOW_MS,
    });

    if (!rateLimit.allowed) {
      chatLogger.warn("rate_limited", { requestId, ip });
      return Response.json(
        {
          success: false,
          error: "Too many chat messages. Please try again in a few minutes.",
        } satisfies ApiResponse,
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const parsed = chatRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return Response.json(
        {
          success: false,
          error: formatZodError(parsed.error),
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const body = parsed.data;
    const anonymousSessionId = getChatSessionId(request) || createChatSessionId();

    const conversation = await getOrCreateConversation({
      conversationId: body.conversationId,
      anonymousSessionId,
      auditId: body.auditId,
      requestId,
    });

    const [audit, recentMessages] = await Promise.all([
      fetchAuditForChat({ auditId: body.auditId, requestId }),
      getRecentMessages({
        conversationId: conversation.conversationId,
        anonymousSessionId,
        requestId,
      }),
    ]);

    await saveChatMessage({
      conversationId: conversation.conversationId,
      role: "user",
      content: body.message,
      metadata: {
        requestId,
        auditId: body.auditId || null,
        pagePath: body.pagePath || null,
      },
      requestId,
    });

    const modelId = getChatModelId();
    const messages: ModelMessage[] = [
      {
        role: "user",
        content: buildContextPrompt({
          audit,
          pagePath: body.pagePath,
          pageTitle: body.clientContext?.pageTitle,
        }),
      },
      ...recentMessages.map((message) => ({
        role: message.role as "user" | "assistant",
        content: trimForContext(message.content),
      })),
      {
        role: "user",
        content: body.message,
      },
    ];

    chatLogger.info("stream_start", {
      requestId,
      conversationId: conversation.conversationId,
      auditId: body.auditId,
      model: modelId,
    });

    const result = streamText({
      model: getChatModel(),
      system: buildSystemPrompt(),
      messages,
      maxOutputTokens: 700,
      temperature: 0.4,
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

        chatLogger.info("stream_finish", {
          requestId,
          conversationId: conversation.conversationId,
          finishReason: event.finishReason,
          latencyMs: Date.now() - startedAt,
        });
      },
      onError: (error) => {
        chatLogger.error("stream_error", {
          requestId,
          conversationId: conversation.conversationId,
          message: error instanceof Error ? error.message : String(error),
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

    return response;
  } catch (err) {
    chatLogger.error("request_failed", {
      requestId,
      message: err instanceof Error ? err.message : String(err),
      latencyMs: Date.now() - startedAt,
    });

    const isConfigError =
      err instanceof Error && err.message.includes("OPENAI_API_KEY");

    return Response.json(
      {
        success: false,
        error: isConfigError
          ? "AI chat is not configured yet."
          : "The assistant is unavailable right now. Please try again.",
      } satisfies ApiResponse,
      { status: isConfigError ? 503 : 500 }
    );
  }
}

function trimForContext(content: string): string {
  return content.length > 1800 ? `${content.slice(0, 1800)}...` : content;
}
