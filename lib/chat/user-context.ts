import { isSupabaseConfigured, supabaseAdmin } from "@/lib/supabase";
import type { AuditResult } from "@/lib/types";
import type { ChatUserContext } from "@/lib/ai/types";
import type { ResolvedChatIdentity } from "./auth";
import { getCached, setCached } from "./cache";
import { chatLogger } from "./logging";

const PROFILE_CACHE_TTL_MS = 30 * 1000;

export async function buildUserContext({
  identity,
  anonymousSessionId,
  audit,
  requestId,
}: {
  identity: ResolvedChatIdentity;
  anonymousSessionId: string;
  audit?: AuditResult;
  requestId: string;
}): Promise<ChatUserContext> {
  const stored = await fetchStoredProfile({
    userId: identity.userId,
    anonymousSessionId,
    requestId,
  });

  const inferredTeamSize = audit?.inputData?.teamSize;

  return {
    userId: identity.userId,
    email: identity.email || stored?.email || undefined,
    displayName: identity.displayName || stored?.display_name || undefined,
    companyName: stored?.company_name || undefined,
    role: stored?.role || undefined,
    teamSize: stored?.team_size || inferredTeamSize || undefined,
    preferences: stored?.preferences || {},
    traits: stored?.traits || {},
    source: identity.userId ? "authenticated" : "anonymous",
  };
}

export async function updateUserProfileFromTurn({
  user,
  anonymousSessionId,
  audit,
  requestId,
}: {
  user: ChatUserContext;
  anonymousSessionId: string;
  audit?: AuditResult;
  requestId: string;
}) {
  if (!isSupabaseConfigured) return;

  const profilePatch = {
    user_id: user.userId || null,
    anonymous_session_id: user.userId ? null : anonymousSessionId,
    email: user.email || null,
    display_name: user.displayName || null,
    company_name: user.companyName || null,
    role: user.role || null,
    team_size: user.teamSize || audit?.inputData?.teamSize || null,
    preferences: user.preferences || {},
    traits: {
      ...user.traits,
      lastPrimaryUseCase: audit?.inputData?.primaryUseCase || user.traits.lastPrimaryUseCase,
    },
    last_active_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const conflictTarget = user.userId ? "user_id" : "anonymous_session_id";

  const { error } = await supabaseAdmin
    .from("chat_user_profiles")
    .upsert(profilePatch, { onConflict: conflictTarget });

  if (error) {
    chatLogger.warn("profile_upsert_failed", {
      requestId,
      message: error.message,
    });
  }
}

async function fetchStoredProfile({
  userId,
  anonymousSessionId,
  requestId,
}: {
  userId?: string;
  anonymousSessionId: string;
  requestId: string;
}) {
  if (!isSupabaseConfigured) return null;
  const cacheKey = userId
    ? `profile:user:${userId}`
    : `profile:anonymous:${anonymousSessionId}`;
  const cached = getCached<{
    email: string | null;
    display_name: string | null;
    company_name: string | null;
    role: string | null;
    team_size: number | null;
    preferences: Record<string, unknown>;
    traits: Record<string, unknown>;
  } | null>(cacheKey);

  if (cached !== undefined) return cached;

  const query = supabaseAdmin
    .from("chat_user_profiles")
    .select("email, display_name, company_name, role, team_size, preferences, traits")
    .limit(1);

  const { data, error } = userId
    ? await query.eq("user_id", userId).maybeSingle()
    : await query.eq("anonymous_session_id", anonymousSessionId).maybeSingle();

  if (error) {
    chatLogger.warn("profile_fetch_failed", {
      requestId,
      message: error.message,
    });
    return setCached(cacheKey, null, PROFILE_CACHE_TTL_MS);
  }

  return setCached(cacheKey, data, PROFILE_CACHE_TTL_MS);
}
