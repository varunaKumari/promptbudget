import { NextRequest } from "next/server";
import { z } from "zod";
import { sendEmail } from "@/lib/email";
import {
  isSupabaseAdminConfigured,
  supabaseAdmin,
} from "@/lib/supabase";
import type { ApiResponse } from "@/lib/types";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

const resetPasswordSchema = z.object({
  email: z.string().trim().email().max(254).toLowerCase(),
});

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return Response.json(
        { success: false, error: "Too many reset attempts. Please try again later." } satisfies ApiResponse,
        { status: 429 }
      );
    }

    if (!isSupabaseAdminConfigured) {
      return Response.json(
        { success: false, error: "Authentication is not configured yet." } satisfies ApiResponse,
        { status: 503 }
      );
    }

    const parsed = resetPasswordSchema.safeParse(await request.json());
    if (!parsed.success) {
      return Response.json(
        { success: false, error: parsed.error.issues[0]?.message || "Enter a valid email." } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const origin = getRequestOrigin(request);
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/update-password")}`;

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: parsed.data.email,
      options: {
        redirectTo,
      },
    });

    if (error || !data.properties?.action_link) {
      console.error("[auth] reset link generation failed:", error);
      return Response.json(
        { success: false, error: "Unable to create a reset link." } satisfies ApiResponse,
        { status: 500 }
      );
    }

    const sent = await sendEmail({
      to: parsed.data.email,
      subject: "Reset your PromptBudget password",
      html: buildPromptBudgetResetEmail(data.properties.action_link),
    });

    if (!sent) {
      return Response.json(
        { success: false, error: "Unable to send the reset email." } satisfies ApiResponse,
        { status: 500 }
      );
    }

    return Response.json(
      { success: true, data: { sent: true } } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (err) {
    console.error("[auth] reset password request failed:", err);
    return Response.json(
      { success: false, error: "Unable to send reset email." } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

function getRequestOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configured) return configured;

  const origin = request.headers.get("origin");
  if (origin) return origin;

  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") || host.startsWith("127.0.0.1")
    ? "http"
    : "https";

  return `${protocol}://${host}`;
}

function buildPromptBudgetResetEmail(actionLink: string): string {
  return `
    <div style="margin:0;background:#f7f7f4;padding:40px 16px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#0b0b0b;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e8e8e2;padding:36px;">
        <div style="font-size:22px;font-weight:700;letter-spacing:-0.02em;">PromptBudget</div>
        <h1 style="margin:40px 0 12px;font-size:28px;line-height:1.15;letter-spacing:-0.03em;">Reset your password</h1>
        <p style="margin:0 0 28px;color:#555;font-size:16px;line-height:1.6;">
          Use this secure link to create a new PromptBudget password.
        </p>
        <a href="${actionLink}" style="display:block;background:#b8ff00;color:#000;text-decoration:none;text-align:center;font-weight:700;font-size:16px;padding:18px 24px;">
          Reset password
        </a>
        <p style="margin:28px 0 0;color:#777;font-size:13px;line-height:1.6;">
          If you did not request this email, you can safely ignore it.
        </p>
      </div>
    </div>
  `;
}
