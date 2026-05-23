import { NextRequest } from "next/server";
import { z } from "zod";
import type { ApiResponse } from "@/lib/types";
import { chatLogger } from "./logging";
import { checkRateLimit, getClientIp } from "./rate-limit";

const MAX_BODY_BYTES = 8 * 1024 * 1024;
const ALLOWED_ATTACHMENT_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "application/octet-stream",
];

export interface ChatRequestGuard {
  requestId: string;
  ip: string;
}

export function sanitizeText(value: string): string {
  return value
    .replace(/\u0000/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
}

export function sanitizeForLog(value: unknown): unknown {
  if (typeof value !== "string") return value;
  return value.replace(/(sk-[a-zA-Z0-9_-]{8,})/g, "sk-***");
}

export function safeErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return String(sanitizeForLog(error));
  return String(sanitizeForLog(error.message));
}

export function withSecurityHeaders(response: Response): Response {
  response.headers.set("x-content-type-options", "nosniff");
  response.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  response.headers.set("x-robots-tag", "noindex");
  return response;
}

export function jsonError(
  error: string,
  status: number,
  headers?: HeadersInit
): Response {
  return withSecurityHeaders(
    Response.json(
      { success: false, error } satisfies ApiResponse,
      { status, headers }
    )
  );
}

export async function parseJsonBody(request: NextRequest): Promise<unknown> {
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    throw new ChatHttpError("Content-Type must be application/json.", 415);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    throw new ChatHttpError("Request is too large.", 413);
  }

  return request.json();
}

export function assertAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return;

  const allowed = new Set(
    [
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ].filter((value): value is string => !!value)
  );

  if (!allowed.has(origin)) {
    throw new ChatHttpError("Origin is not allowed.", 403);
  }
}

export function assertAttachmentSafe({
  mediaType,
  dataUrl,
}: {
  mediaType: string;
  dataUrl?: string;
}) {
  if (!ALLOWED_ATTACHMENT_TYPES.includes(mediaType)) {
    throw new ChatHttpError("Unsupported attachment type.", 400);
  }

  if (dataUrl && !dataUrl.startsWith(`data:${mediaType};base64,`)) {
    throw new ChatHttpError("Invalid attachment data.", 400);
  }
}

export function getGuardContext(request: NextRequest): ChatRequestGuard {
  return {
    requestId: request.headers.get("x-request-id") || crypto.randomUUID(),
    ip: getClientIp(request.headers),
  };
}

export function enforceRateLimit({
  key,
  limit,
  windowMs,
  requestId,
}: {
  key: string;
  limit: number;
  windowMs: number;
  requestId: string;
}) {
  const rateLimit = checkRateLimit({ key, limit, windowMs });
  if (rateLimit.allowed) return;

  chatLogger.warn("rate_limited", { requestId, key });
  throw new ChatHttpError("Too many requests. Please try again later.", 429, {
    "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
  });
}

export function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw new ChatHttpError(
      parsed.error.issues[0]?.message || "Invalid request payload.",
      400
    );
  }
  return parsed.data;
}

export class ChatHttpError extends Error {
  status: number;
  headers?: HeadersInit;

  constructor(message: string, status: number, headers?: HeadersInit) {
    super(message);
    this.name = "ChatHttpError";
    this.status = status;
    this.headers = headers;
  }
}
