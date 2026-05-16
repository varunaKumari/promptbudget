// ============================================================
// POST /api/summary — Generate AI summary via Anthropic API
// Falls back to templated summary on API failure.
// ============================================================

import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateTemplatedSummary } from "@/lib/audit-engine";
import type { AuditResult, ApiResponse } from "@/lib/types";

// Full prompt is documented in PROMPTS.md
const SYSTEM_PROMPT = `You are a financial advisor specializing in AI/SaaS tool optimization for startups and engineering teams. You write clear, concise, actionable summaries.

Your tone is:
- Professional but friendly
- Specific with numbers (always cite dollar amounts)
- Honest — if a company is already well-optimized, say so
- Action-oriented — every sentence should help the reader decide what to do

Never use marketing fluff. Never be vague. Always reference the specific tools and numbers from the audit data.`;

const USER_PROMPT_TEMPLATE = `Based on the following AI spend audit data, write a personalized ~100-word summary paragraph for the user.

Audit Data:
- Total tools audited: {{toolCount}}
- Current monthly spend: ${{currentSpend}}/month
- Potential optimized spend: ${{optimizedSpend}}/month
- Total monthly savings: ${{monthlySavings}}/month (${{annualSavings}}/year)
- Savings percentage: {{savingsPercent}}%

Per-tool breakdown:
{{toolBreakdown}}

Instructions:
1. Start with the headline finding (total savings opportunity or "well-optimized")
2. Call out the #1 biggest savings opportunity by name
3. If savings > $500/mo, mention that Credex can help capture additional savings through discounted credits
4. If savings < $100/mo, be honest that they're spending well
5. End with one clear next step
6. Keep it to ~100 words. Be specific, cite dollar amounts.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auditId, results }: { auditId: string; results: AuditResult } = body;

    if (!results) {
      return Response.json(
        { success: false, error: "Audit results are required" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    let summary: string;

    try {
      summary = await generateAISummary(results);
    } catch (aiError) {
      console.error("AI summary generation failed, using fallback:", aiError);
      summary = generateTemplatedSummary(results);
    }

    // Save summary to Supabase (non-blocking)
    if (auditId) {
      supabase
        .from("audits")
        .update({ ai_summary: summary })
        .eq("id", auditId)
        .then(({ error }) => {
          if (error) console.error("Failed to save AI summary:", error);
        });
    }

    return Response.json(
      { success: true, data: { summary } } satisfies ApiResponse,
      { status: 200 }
    );
  } catch (err) {
    console.error("Summary API error:", err);
    return Response.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

async function generateAISummary(results: AuditResult): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "sk-ant-xxx") {
    throw new Error("Anthropic API key not configured");
  }

  // Build the tool breakdown string
  const toolBreakdown = results.toolResults
    .map((t) => {
      const rec = t.topRecommendation;
      if (!rec || rec.type === "optimal") {
        return `- ${t.toolName} (${t.currentPlan}): $${t.currentMonthlySpend}/mo — Already optimal`;
      }
      return `- ${t.toolName} (${t.currentPlan}): $${t.currentMonthlySpend}/mo → ${rec.action} saves $${rec.monthlySavings}/mo. Reason: ${rec.reason.split(".")[0]}.`;
    })
    .join("\n");

  const userPrompt = USER_PROMPT_TEMPLATE
    .replace("{{toolCount}}", String(results.toolResults.length))
    .replace("{{currentSpend}}", String(results.totalCurrentMonthlySpend))
    .replace("{{optimizedSpend}}", String(results.totalOptimizedMonthlySpend))
    .replace("{{monthlySavings}}", String(results.totalMonthlySavings))
    .replace("{{annualSavings}}", String(results.totalAnnualSavings))
    .replace("{{savingsPercent}}", String(results.savingsPercentage))
    .replace("{{toolBreakdown}}", toolBreakdown);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (data.content?.[0]?.text) {
    return data.content[0].text.trim();
  }

  throw new Error("No text content in Anthropic response");
}
