// ============================================================
// POST /api/chat/feedback - Store assistant response feedback
// ============================================================

import { NextRequest } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { resolveChatIdentity } from "@/lib/chat/auth";
import { assertConversationAccess } from "@/lib/chat/conversations";
import { trackChatEvent } from "@/lib/chat/monitoring";
import {
  assertAllowedOrigin,
  ChatHttpError,
  enforceRateLimit,
  getGuardContext,
  jsonError,
  parseJsonBody,
  parseOrThrow,
  sanitizeText,
  withSecurityHeaders,
} from "@/lib/chat/security";
import { getChatSessionId } from "@/lib/chat/session";
import type { ApiResponse } from "@/lib/types";

export const runtime = "nodejs";

const feedbackSchema = z.object({
  conversationId: z.string().uuid(),
  messageId: z.string().uuid().optional(),
  rating: z.enum(["like", "dislike"]),
  content: z.string().max(8000).transform(sanitizeText).optional(),
});

export async function POST(request: NextRequest) {
  const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
  const guard = getGuardContext(request);
  const startedAt = Date.now();

  try {
    assertAllowedOrigin(request);
    enforceRateLimit({
      key: `chat:feedback:${guard.ip}`,
      limit: 60,
      windowMs: 10 * 60 * 1000,
      requestId,
    });

    const parsed = parseOrThrow(feedbackSchema, await parseJsonBody(request));

    if (!isSupabaseConfigured) {
      return withSecurityHeaders(Response.json(
        { success: true, data: { saved: false } } satisfies ApiResponse,
        { status: 200 }
      ));
    }

    const { conversationId, messageId, rating, content } = parsed;
    const sessionId = getChatSessionId(request);
    const identity = await resolveChatIdentity({ request, requestId });
    const hasAccess = await assertConversationAccess({
      conversationId,
      anonymousSessionId: sessionId || "",
      userId: identity.userId,
    });

    if (!hasAccess) {
      return jsonError("Conversation not found.", 404);
    }

    let targetMessageId = messageId;

    if (!targetMessageId) {
      let query = supabaseAdmin
        .from("chat_messages")
        .select("id")
        .eq("conversation_id", conversationId)
        .eq("role", "assistant")
        .order("created_at", { ascending: false })
        .limit(1);

      if (content) {
        query = query.eq("content", content);
      }

      const { data } = await query.maybeSingle();
      targetMessageId = data?.id;
    }

    if (!targetMessageId) {
      return jsonError("Message not found.", 404);
    }

    const { data: existing } = await supabaseAdmin
      .from("chat_messages")
      .select("metadata")
      .eq("id", targetMessageId)
      .maybeSingle();

    const metadata =
      existing?.metadata && typeof existing.metadata === "object"
        ? (existing.metadata as Record<string, unknown>)
        : {};

    const { error } = await supabaseAdmin
      .from("chat_messages")
      .update({
        metadata: {
          ...metadata,
          feedback: rating,
          feedbackAt: new Date().toISOString(),
        },
      })
      .eq("id", targetMessageId);

    if (error) {
      trackChatEvent({
        level: "warn",
        event: "feedback_save_failed",
        route: "/api/chat/feedback",
        requestId,
        error,
      });

      return jsonError("Unable to save feedback.", 500);
    }

    return withSecurityHeaders(Response.json(
      { success: true, data: { saved: true } } satisfies ApiResponse,
      { status: 200 }
    ));
  } catch (err) {
    trackChatEvent({
      level: "error",
      event: "feedback_request_failed",
      route: "/api/chat/feedback",
      requestId,
      latencyMs: Date.now() - startedAt,
      error: err,
    });

    if (err instanceof ChatHttpError) {
      return jsonError(err.message, err.status, err.headers);
    }

    return jsonError("Unable to save feedback.", 500);
  }
}
