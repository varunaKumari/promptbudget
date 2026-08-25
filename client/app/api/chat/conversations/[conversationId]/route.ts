// ============================================================
// GET/DELETE /api/chat/conversations/[conversationId]
// ============================================================

import { NextRequest } from "next/server";
import { z } from "zod";
import { resolveChatIdentity } from "@/lib/chat/auth";
import {
  archiveConversation,
  getConversationMessages,
} from "@/lib/chat/conversations";
import { trackChatEvent } from "@/lib/chat/monitoring";
import {
  assertAllowedOrigin,
  ChatHttpError,
  enforceRateLimit,
  getGuardContext,
  jsonError,
  withSecurityHeaders,
} from "@/lib/chat/security";
import {
  buildChatSessionCookie,
  createChatSessionId,
  getChatSessionId,
} from "@/lib/chat/session";
import type { ApiResponse } from "@/lib/types";

export const runtime = "nodejs";

const paramsSchema = z.object({
  conversationId: z.string().uuid(),
});

interface RouteProps {
  params: Promise<{ conversationId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteProps) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const guard = getGuardContext(request);
  const startedAt = Date.now();

  try {
    assertAllowedOrigin(request);
    enforceRateLimit({
      key: `chat:messages:${guard.ip}`,
      limit: 120,
      windowMs: 10 * 60 * 1000,
      requestId,
    });

    const parsed = paramsSchema.safeParse(await params);

    if (!parsed.success) {
      return jsonError("Invalid conversation ID.", 400);
    }

    const sessionId = getChatSessionId(request) || createChatSessionId();
    const identity = await resolveChatIdentity({ request, requestId });
    const messages = await getConversationMessages({
      conversationId: parsed.data.conversationId,
      anonymousSessionId: sessionId,
      userId: identity.userId,
      requestId,
    });

    const response = Response.json(
      {
        success: true,
        data: { messages },
      } satisfies ApiResponse,
      {
        status: 200,
        headers: { "x-request-id": requestId },
      }
    );

    response.headers.append("Set-Cookie", buildChatSessionCookie(sessionId));
    return withSecurityHeaders(response);
  } catch (err) {
    trackChatEvent({
      level: "error",
      event: "conversation_messages_request_failed",
      route: "/api/chat/conversations/[conversationId]",
      requestId,
      latencyMs: Date.now() - startedAt,
      error: err,
    });

    if (err instanceof ChatHttpError) {
      return jsonError(err.message, err.status, err.headers);
    }

    return jsonError("Unable to load chat messages.", 500);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const guard = getGuardContext(request);
  const startedAt = Date.now();

  try {
    enforceRateLimit({
      key: `chat:delete:${guard.ip}`,
      limit: 30,
      windowMs: 10 * 60 * 1000,
      requestId,
    });

    const parsed = paramsSchema.safeParse(await params);

    if (!parsed.success) {
      return jsonError("Invalid conversation ID.", 400);
    }

    const sessionId = getChatSessionId(request);
    const identity = await resolveChatIdentity({ request, requestId });

    if (!sessionId && !identity.userId) {
      return jsonError("Conversation not found.", 404);
    }

    const archived = await archiveConversation({
      conversationId: parsed.data.conversationId,
      anonymousSessionId: sessionId || "",
      userId: identity.userId,
      requestId,
    });

    return withSecurityHeaders(Response.json(
      {
        success: archived,
        data: { archived },
        error: archived ? undefined : "Conversation not found.",
      } satisfies ApiResponse,
      { status: archived ? 200 : 404 }
    ));
  } catch (err) {
    trackChatEvent({
      level: "error",
      event: "conversation_delete_request_failed",
      route: "/api/chat/conversations/[conversationId]",
      requestId,
      latencyMs: Date.now() - startedAt,
      error: err,
    });

    if (err instanceof ChatHttpError) {
      return jsonError(err.message, err.status, err.headers);
    }

    return jsonError("Unable to delete chat conversation.", 500);
  }
}
