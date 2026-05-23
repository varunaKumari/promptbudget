// ============================================================
// GET /api/chat/conversations - List chat conversations
// ============================================================

import { NextRequest } from "next/server";
import { resolveChatIdentity } from "@/lib/chat/auth";
import { listConversations } from "@/lib/chat/conversations";
import { trackChatEvent } from "@/lib/chat/monitoring";
import {
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

export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const guard = getGuardContext(request);
  const startedAt = Date.now();

  try {
    enforceRateLimit({
      key: `chat:list:${guard.ip}`,
      limit: 80,
      windowMs: 10 * 60 * 1000,
      requestId,
    });

    const sessionId = getChatSessionId(request) || createChatSessionId();
    const identity = await resolveChatIdentity({ request, requestId });
    const conversations = await listConversations({
      anonymousSessionId: sessionId,
      userId: identity.userId,
      requestId,
    });

    const response = Response.json(
      {
        success: true,
        data: { conversations },
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
      event: "conversations_request_failed",
      route: "/api/chat/conversations",
      requestId,
      latencyMs: Date.now() - startedAt,
      error: err,
    });

    if (err instanceof ChatHttpError) {
      return jsonError(err.message, err.status, err.headers);
    }

    return jsonError("Unable to load chat conversations.", 500);
  }
}
