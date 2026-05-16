"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { AuditResult } from "@/lib/types";
import { ResultCard } from "@/components/result-card";
import { LeadForm } from "@/components/lead-form";
import { BenchmarkSection } from "@/components/benchmark-section";
import { SpendChart, SpendDonut } from "@/components/spend-charts";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

interface ResultsClientProps {
  results: AuditResult;
  auditId: string;
}

export function ResultsClient({ results, auditId }: ResultsClientProps) {
  const [aiSummary, setAiSummary] = useState(results.aiSummary || "");
  const [summaryLoading, setSummaryLoading] = useState(!results.aiSummary);
  const [copied, setCopied] = useState(false);

  // Fetch AI summary if not already present
  useEffect(() => {
    if (results.aiSummary) return;

    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ auditId, results }),
        });
        const data = await res.json();
        if (data.success && data.data?.summary) {
          setAiSummary(data.data.summary);
        }
      } catch {
        // Silently fail — summary is nice-to-have
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [auditId, results]);

  const copyShareLink = async () => {
    const url = `${window.location.origin}/results/${auditId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const {
    totalCurrentMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsPercentage,
    overallStatus,
    toolResults,
  } = results;

  const isOptimal = overallStatus === "optimal";
  const isSignificant = overallStatus === "significant-savings";

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight"
          >
            <span className="text-2xl">📊</span>
            <span>PromptBudget</span>
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={copyShareLink}
              className="rounded-full"
            >
              {copied ? "✓ Copied!" : "📋 Copy Link"}
            </Button>
            <Link href="/audit">
              <Button variant="outline" size="sm" className="rounded-full">
                New Audit
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Hero Savings */}
        <section className="mb-12 text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Your AI Spend Audit
          </p>

          {!isOptimal ? (
            <>
              <div className="mb-2 text-6xl font-black tracking-tight md:text-8xl">
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
                  ${totalMonthlySavings.toLocaleString()}
                </span>
              </div>
              <p className="mb-2 text-xl text-muted-foreground">
                potential savings per month
              </p>
              <p className="text-lg font-medium text-foreground">
                ${totalAnnualSavings.toLocaleString()}/year · {savingsPercentage}%
                reduction · on ${totalCurrentMonthlySpend.toLocaleString()}/mo
                current spend
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 text-6xl">✅</div>
              <h1 className="mb-2 text-3xl font-bold">
                You&apos;re Spending Well
              </h1>
              <p className="text-lg text-muted-foreground">
                Your AI stack of {toolResults.length} tool
                {toolResults.length > 1 ? "s" : ""} at $
                {totalCurrentMonthlySpend.toLocaleString()}/mo is well-optimized.
                No obvious waste found.
              </p>
            </>
          )}
        </section>

        {/* AI Summary */}
        <section className="mb-12">
          <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                AI-Powered Summary
              </h2>
            </div>
            {summaryLoading ? (
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
                <p className="text-muted-foreground">
                  Generating personalized summary...
                </p>
              </div>
            ) : (
              <p className="text-base leading-relaxed text-foreground">
                {aiSummary || "Summary unavailable. See the detailed breakdown below."}
              </p>
            )}
          </div>
        </section>

        {/* Credex CTA for significant savings */}
        {isSignificant && (
          <section className="mb-12">
            <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 p-8 text-white md:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="mb-2 text-2xl font-bold">
                    Save Even More with Credex
                  </h2>
                  <p className="max-w-lg text-white/80">
                    With ${totalMonthlySavings.toLocaleString()}/mo in potential
                    savings, Credex can help you capture additional discounts
                    through AI infrastructure credits sourced from companies that
                    overforecast.
                  </p>
                </div>
                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-12 items-center justify-center whitespace-nowrap rounded-full bg-white px-8 font-semibold text-indigo-700 transition-all hover:bg-white/90 hover:scale-105"
                >
                  Book Credex Consultation →
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Per-Tool Results */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold">
            Tool-by-Tool Breakdown
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {toolResults.map((result) => (
              <ResultCard key={result.toolId} result={result} />
            ))}
          </div>
        </section>

        {/* Visualizations */}
        <section className="mb-12 grid gap-6 md:grid-cols-2">
          <SpendChart toolResults={toolResults} />
          <SpendDonut toolResults={toolResults} />
        </section>

        {/* Benchmark Comparison */}
        <section className="mb-12">
          <BenchmarkSection
            totalMonthlySpend={totalCurrentMonthlySpend}
            teamSize={results.inputData?.teamSize ?? 1}
          />
        </section>

        {/* Lead Capture — after value is shown */}
        <section className="mb-12">
          <LeadForm
            auditId={auditId}
            savingsAmount={totalMonthlySavings}
          />
        </section>

        {/* Share CTA */}
        <section className="mb-12 text-center">
          <p className="mb-4 text-sm text-muted-foreground">
            Know someone overspending on AI tools?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={`https://twitter.com/intent/tweet?text=I%20just%20audited%20my%20AI%20tool%20spend%20and%20found%20%24${totalMonthlySavings}%2Fmo%20in%20savings.%20Try%20it%20free%3A&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-all hover:bg-muted"
            >
              Share on 𝕏
            </a>
            <Button
              variant="outline"
              onClick={copyShareLink}
              className="rounded-full"
            >
              {copied ? "✓ Copied!" : "Copy Share Link"}
            </Button>
          </div>
        </section>

        {/* Run Another Audit */}
        <section className="text-center">
          <Link href="/audit">
            <Button variant="outline" size="lg" className="rounded-full">
              Run Another Audit
            </Button>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>📊</span>
            <span>
              PromptBudget — powered by{" "}
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground hover:underline"
              >
                Credex
              </a>
            </span>
          </div>
          <span>All pricing data from official vendor pages</span>
        </div>
      </footer>
    </div>
  );
}
