// ============================================================
// GET /api/chat/conversations - List chat conversations
// ============================================================

import { NextRequest } from "next/server";
import { listConversations } from "@/lib/chat/conversations";
import { chatLogger } from "@/lib/chat/logging";
import {
  buildChatSessionCookie,
  createChatSessionId,
  getChatSessionId,
} from "@/lib/chat/session";
import type { ApiResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();

  try {
    const sessionId = getChatSessionId(request) || createChatSessionId();
    const conversations = await listConversations({
      anonymousSessionId: sessionId,
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
    return response;
  } catch (err) {
    chatLogger.error("conversations_request_failed", {
      requestId,
      message: err instanceof Error ? err.message : String(err),
    });

    return Response.json(
      {
        success: false,
        error: "Unable to load chat conversations.",
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
