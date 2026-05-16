import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import type { AuditResult } from "@/lib/types";
import { ResultsClient } from "./results-client";
import { ResultsFallback } from "./results-fallback";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ResultsPageProps): Promise<Metadata> {
  const { id } = await params;

  // Try to fetch audit from Supabase for OG tags
  const { data } = await supabase
    .from("audits")
    .select("results")
    .eq("id", id)
    .single();

  if (!data) {
    // Still return valid metadata — the client might have the data cached
    return {
      title: "AI Spend Audit Results — PromptBudget",
      description:
        "View your personalized AI spend audit results. Run your own free audit at PromptBudget.",
    };
  }

  const results = data.results as AuditResult;
  const toolCount = results.toolResults?.length ?? 0;
  const savings = results.totalMonthlySavings ?? 0;
  const annual = results.totalAnnualSavings ?? 0;

  const title =
    savings > 0
      ? `Save $${savings.toLocaleString()}/mo on AI Tools — PromptBudget`
      : `AI Spend Audit Results — PromptBudget`;

  const description =
    savings > 0
      ? `This team audited ${toolCount} AI tools and found $${savings.toLocaleString()}/month ($${annual.toLocaleString()}/year) in potential savings. Run your own free audit at PromptBudget.`
      : `This team audited ${toolCount} AI tools and is spending optimally. Run your own free audit at PromptBudget.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;

  // Try to fetch audit from Supabase
  const { data } = await supabase
    .from("audits")
    .select("id, results, ai_summary, created_at")
    .eq("id", id)
    .single();

  // If Supabase has data, render directly (server-side)
  if (data) {
    const results = data.results as AuditResult;
    results.id = data.id;
    results.aiSummary = data.ai_summary || undefined;
    results.createdAt = data.created_at;

    return <ResultsClient results={results} auditId={data.id} />;
  }

  // If Supabase doesn't have data (tables not created, or network error),
  // render a client component that checks sessionStorage for cached results.
  return <ResultsFallback auditId={id} />;
}
