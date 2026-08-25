import { NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import { chatLogger } from "./logging";

export interface ResolvedChatIdentity {
  userId?: string;
  email?: string;
  displayName?: string;
}

export async function resolveChatIdentity({
  request,
  requestId,
}: {
  request: NextRequest;
  requestId: string;
}): Promise<ResolvedChatIdentity> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : null;

  if (!token || !isSupabaseConfigured) return {};

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      chatLogger.warn("auth_user_lookup_failed", {
        requestId,
        message: error?.message,
      });
      return {};
    }

    return {
      userId: data.user.id,
      email: data.user.email || undefined,
      displayName:
        typeof data.user.user_metadata?.name === "string"
          ? data.user.user_metadata.name
          : undefined,
    };
  } catch (err) {
    chatLogger.warn("auth_user_lookup_exception", {
      requestId,
      message: err instanceof Error ? err.message : String(err),
    });
    return {};
  }
}
