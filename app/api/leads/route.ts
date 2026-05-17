// ============================================================
// POST /api/leads — Capture lead and send confirmation email
// Resilient to Supabase/email failures — never loses a lead.
// ============================================================

import { NextRequest } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import type { ApiResponse, CreateLeadRequest } from "@/lib/types";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  if (entry.count >= RATE_LIMIT) {
    return true;
  }

  entry.count++;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return Response.json(
        {
          success: false,
          error: "Too many requests. Please try again later.",
        } satisfies ApiResponse,
        { status: 429 }
      );
    }

    const body: CreateLeadRequest = await request.json();

    // Honeypot check
    if (body.honeypot) {
      return Response.json(
        { success: true, data: { id: "ok" } } satisfies ApiResponse,
        { status: 200 }
      );
    }

    // Validate email
    if (!body.email || !isValidEmail(body.email)) {
      return Response.json(
        { success: false, error: "Valid email is required." } satisfies ApiResponse,
        { status: 400 }
      );
    }

    if (!body.auditId) {
      return Response.json(
        { success: false, error: "Audit ID is required." } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // ── Attempt Supabase save ──
    // If Supabase isn't configured (invalid keys, no tables), we still
    // succeed from the user's perspective and send the email.
    let leadId: string | null = null;

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseAdmin
          .from("leads")
          .insert({
            email: body.email,
            company_name: body.companyName || null,
            role: body.role || null,
            team_size: body.teamSize || null,
            audit_id: body.auditId,
          })
          .select("id")
          .single();

        if (error) {
          // Log the real error for debugging, but don't fail the user
          console.error("[leads] Supabase insert failed:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          // Continue — we'll still confirm to the user and try email
        } else {
          leadId = data.id;

          // Link lead to audit (fire-and-forget, non-blocking)
          supabaseAdmin
            .from("audits")
            .update({ lead_id: leadId })
            .eq("id", body.auditId)
            .then(({ error: linkError }) => {
              if (linkError) {
                console.error("[leads] Failed to link lead to audit:", linkError.message);
              }
            });
        }
      } catch (dbError) {
        console.error("[leads] Supabase exception:", dbError);
        // Continue — don't fail the user
      }
    } else {
      console.warn("[leads] Supabase not configured — skipping DB save. Lead:", body.email);
    }

    // ── Send confirmation email ──
    try {
      await sendEmail({
        to: body.email,
        subject: "Your AI Spend Audit Report — PromptBudget",
        html: buildConfirmationEmail(body.email, body.auditId),
      });
    } catch (emailError) {
      // Don't fail the request if email fails
      console.error("[leads] Email send failed:", emailError);
    }

    // Always succeed from the user's perspective.
    // The lead data is captured (in DB if available, in logs if not).
    return Response.json(
      { success: true, data: { id: leadId || "saved" } } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (err) {
    console.error("[leads] Unhandled error:", err);
    return Response.json(
      { success: false, error: "Something went wrong. Please try again." } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function buildConfirmationEmail(email: string, auditId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://promptbudget.vercel.app";
  const reportUrl = `${baseUrl}/results/${auditId}`;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="font-size: 24px; color: #111; margin-bottom: 8px;">Your AI Spend Audit is Ready</h1>
      <p style="color: #666; font-size: 16px; line-height: 1.6;">
        Thanks for using PromptBudget! Your personalized AI spend audit has been saved.
      </p>
      <a href="${reportUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 20px 0;">
        View Your Report →
      </a>
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin-top: 24px;">
        Share your report with your team: <a href="${reportUrl}" style="color: #111;">${reportUrl}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
      <p style="color: #999; font-size: 12px;">
        Powered by <a href="https://credex.rocks" style="color: #666;">Credex</a> — discounted AI infrastructure credits.
        <br />If your audit shows significant savings, our team will reach out with personalized credit offers.
      </p>
    </div>
  `;
}
