// ============================================================
// GET/DELETE /api/chat/conversations/[conversationId]
// ============================================================

import { NextRequest } from "next/server";
import { z } from "zod";
import {
  archiveConversation,
  getConversationMessages,
} from "@/lib/chat/conversations";
import { chatLogger } from "@/lib/chat/logging";
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

  try {
    const parsed = paramsSchema.safeParse(await params);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Invalid conversation ID." } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const sessionId = getChatSessionId(request) || createChatSessionId();
    const messages = await getConversationMessages({
      conversationId: parsed.data.conversationId,
      anonymousSessionId: sessionId,
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
    return response;
  } catch (err) {
    chatLogger.error("conversation_messages_request_failed", {
      requestId,
      message: err instanceof Error ? err.message : String(err),
    });

    return Response.json(
      {
        success: false,
        error: "Unable to load chat messages.",
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();

  try {
    const parsed = paramsSchema.safeParse(await params);

    if (!parsed.success) {
      return Response.json(
        { success: false, error: "Invalid conversation ID." } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const sessionId = getChatSessionId(request);

    if (!sessionId) {
      return Response.json(
        { success: false, error: "Conversation not found." } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const archived = await archiveConversation({
      conversationId: parsed.data.conversationId,
      anonymousSessionId: sessionId,
      requestId,
    });

    return Response.json(
      {
        success: archived,
        data: { archived },
        error: archived ? undefined : "Conversation not found.",
      } satisfies ApiResponse,
      { status: archived ? 200 : 404 }
    );
  } catch (err) {
    chatLogger.error("conversation_delete_request_failed", {
      requestId,
      message: err instanceof Error ? err.message : String(err),
    });

    return Response.json(
      {
        success: false,
        error: "Unable to delete chat conversation.",
      } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
