// ============================================================
// POST /api/audit — Run audit and save to Supabase
// Resilient — returns results even if Supabase is down.
// ============================================================

import { NextRequest } from "next/server";
import { supabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";
import { runAudit } from "@/lib/audit-engine";
import type { AuditInput, ApiResponse, CreateAuditResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: AuditInput = body.input;

    // Validate input
    if (!input?.tools || input.tools.length === 0) {
      return Response.json(
        { success: false, error: "At least one tool is required." } satisfies ApiResponse,
        { status: 400 }
      );
    }

    if (!input.teamSize || input.teamSize < 1) {
      return Response.json(
        { success: false, error: "Team size must be at least 1." } satisfies ApiResponse,
        { status: 400 }
      );
    }

    if (!input.primaryUseCase) {
      return Response.json(
        { success: false, error: "Primary use case is required." } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // Run the audit engine
    const results = runAudit(input);

    // Attempt to save to Supabase
    let auditId = crypto.randomUUID();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabaseAdmin
          .from("audits")
          .insert({
            input_data: input,
            results: results,
            is_public: true,
          })
          .select("id")
          .single();

        if (error) {
          console.error("[audit] Supabase insert failed:", {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          // Fall through to use the generated UUID
        } else {
          auditId = data.id;
        }
      } catch (dbError) {
        console.error("[audit] Supabase exception:", dbError);
      }
    } else {
      console.warn("[audit] Supabase not configured — using local UUID:", auditId);
    }

    return Response.json(
      {
        success: true,
        data: { id: auditId, results },
      } satisfies ApiResponse<CreateAuditResponse>,
      { status: 200 }
    );
  } catch (err) {
    console.error("[audit] Unhandled error:", err);
    return Response.json(
      { success: false, error: "Something went wrong. Please try again." } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
