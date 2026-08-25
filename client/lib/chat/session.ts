import { NextRequest } from "next/server";

export const CHAT_SESSION_COOKIE = "pb_chat_session";

export function getChatSessionId(request: NextRequest): string | null {
  return request.cookies.get(CHAT_SESSION_COOKIE)?.value || null;
}

export function createChatSessionId(): string {
  return crypto.randomUUID();
}

export function buildChatSessionCookie(sessionId: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${CHAT_SESSION_COOKIE}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${secure}`;
}
