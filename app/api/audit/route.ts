// ============================================================
// POST /api/audit — Run audit and save to Supabase
// ============================================================

import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { runAudit } from "@/lib/audit-engine";
import type { AuditInput, ApiResponse, CreateAuditResponse } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input: AuditInput = body.input;

    // Validate input
    if (!input?.tools || input.tools.length === 0) {
      return Response.json(
        { success: false, error: "At least one tool is required" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    if (!input.teamSize || input.teamSize < 1) {
      return Response.json(
        { success: false, error: "Team size must be at least 1" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    if (!input.primaryUseCase) {
      return Response.json(
        { success: false, error: "Primary use case is required" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // Run the audit engine
    const results = runAudit(input);

    // Save to Supabase
    const { data, error } = await supabase
      .from("audits")
      .insert({
        input_data: input,
        results: results,
        is_public: true,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      // Still return results even if DB save fails
      return Response.json(
        {
          success: true,
          data: { id: crypto.randomUUID(), results },
        } satisfies ApiResponse<CreateAuditResponse>,
        { status: 200 }
      );
    }

    return Response.json(
      {
        success: true,
        data: { id: data.id, results },
      } satisfies ApiResponse<CreateAuditResponse>,
      { status: 200 }
    );
  } catch (err) {
    console.error("Audit API error:", err);
    return Response.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
