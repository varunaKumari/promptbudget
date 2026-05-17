"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Copy,
  Check,
  ExternalLink,
  Share2,
  Plus,
  Brain,
  Loader2,
  ArrowRight,
} from "lucide-react";
import type { AuditResult } from "@/lib/types";
import { ResultCard } from "@/components/result-card";
import { LeadForm } from "@/components/lead-form";
import { BenchmarkSection } from "@/components/benchmark-section";
import { SpendChart, SpendDonut } from "@/components/spend-charts";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { SiteFooter } from "@/components/site-footer";
import { FadeIn, SlideUp, CountUp } from "@/components/ui/motion";
import { Button } from "@/components/ui/button";

interface ResultsClientProps {
  results: AuditResult;
  auditId: string;
}

// ─── AI Spend Score ───
// Converts the raw savings percentage into a 0-100 score
// Higher = better optimized
function calculateSpendScore(result: AuditResult): number {
  const { savingsPercentage, toolResults } = result;

  // Base score from savings percentage (inverted — low savings = high score)
  const savingsScore = Math.max(0, 100 - savingsPercentage * 2);

  // Bonus for having tools rated as optimal
  const optimalCount = toolResults.filter((t) => t.status === "optimal").length;
  const optimalBonus = (optimalCount / Math.max(toolResults.length, 1)) * 15;

  return Math.min(100, Math.round(savingsScore + optimalBonus));
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-success";
  if (score >= 60) return "text-warning";
  return "text-danger";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Needs work";
  return "Critical";
}

function getScoreRingColor(score: number): string {
  if (score >= 80) return "stroke-success";
  if (score >= 60) return "stroke-warning";
  return "stroke-danger";
}

// ─── Score Gauge ───
function SpendScoreGauge({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 44;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex h-32 w-32 items-center justify-center">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
        {/* Background ring */}
        <circle
          cx="50" cy="50" r="44"
          fill="none"
          className="stroke-muted"
          strokeWidth="6"
        />
        {/* Score ring */}
        <motion.circle
          cx="50" cy="50" r="44"
          fill="none"
          className={getScoreRingColor(score)}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold font-tabular ${getScoreColor(score)}`}>
          <CountUp value={score} duration={1.5} />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {getScoreLabel(score)}
        </span>
      </div>
    </div>
  );
}


export function ResultsClient({ results, auditId }: ResultsClientProps) {
  const [aiSummary, setAiSummary] = useState(results.aiSummary || "");
  const [summaryLoading, setSummaryLoading] = useState(!results.aiSummary);
  const [copied, setCopied] = useState(false);

  const spendScore = useMemo(() => calculateSpendScore(results), [results]);

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
        // summary is nice-to-have
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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Logo size="md" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={copyShareLink}
              className="rounded-lg"
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5 text-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  Copy link
                </>
              )}
            </Button>
            <Link href="/audit">
              <Button variant="outline" size="sm" className="rounded-lg">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New audit
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 mx-auto w-full max-w-5xl px-6 py-10">
        {/* Hero: Score + Savings */}
        <section className="mb-12">
          <SlideUp>
            <div className="flex flex-col items-center gap-8 md:flex-row md:items-start md:gap-12">
              {/* AI Spend Score */}
              <div className="flex flex-col items-center text-center">
                <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  AI Spend Score
                </p>
                <SpendScoreGauge score={spendScore} />
                <p className="mt-2 text-xs text-muted-foreground">
                  {spendScore >= 80
                    ? "Your spend is well-optimized"
                    : spendScore >= 60
                      ? "Room for improvement"
                      : "Significant optimization needed"}
                </p>
              </div>

              {/* Savings or Optimal message */}
              <div className="flex-1 text-center md:text-left">
                {!isOptimal ? (
                  <>
                    <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                      Potential savings
                    </p>
                    <div className="mb-2 text-5xl font-bold tracking-tight md:text-6xl">
                      <span className="font-tabular text-success">
                        $<CountUp value={totalMonthlySavings} />
                      </span>
                      <span className="text-lg font-normal text-muted-foreground">/mo</span>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground md:justify-start">
                      <span className="font-tabular">${totalAnnualSavings.toLocaleString()}/year</span>
                      <span>·</span>
                      <span className="font-tabular">{savingsPercentage}% reduction</span>
                      <span>·</span>
                      <span className="font-tabular">on ${totalCurrentMonthlySpend.toLocaleString()}/mo</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                      <Check className="h-6 w-6 text-success" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold">Well optimized</h1>
                    <p className="text-sm text-muted-foreground">
                      Your AI stack of {toolResults.length} tool
                      {toolResults.length > 1 ? "s" : ""} at $
                      {totalCurrentMonthlySpend.toLocaleString()}/mo is
                      well-optimized. No obvious waste found.
                    </p>
                  </>
                )}
              </div>
            </div>
          </SlideUp>
        </section>

        {/* AI Summary */}
        <FadeIn delay={0.2} className="mb-10">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                AI-Powered Summary
              </h2>
            </div>
            {summaryLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Generating personalized summary...
                </p>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-foreground">
                {aiSummary || "Summary unavailable. See the detailed breakdown below."}
              </p>
            )}
          </div>
        </FadeIn>

        {/* Credex CTA for significant savings */}
        {isSignificant && (
          <FadeIn delay={0.3} className="mb-10">
            <div className="rounded-xl bg-primary p-6 text-primary-foreground md:p-8">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="mb-1.5 text-lg font-bold">
                    Save even more with Credex
                  </h2>
                  <p className="max-w-lg text-sm opacity-80">
                    With ${totalMonthlySavings.toLocaleString()}/mo in potential
                    savings, Credex can help capture additional discounts through
                    AI infrastructure credits sourced from companies that
                    overforecast.
                  </p>
                </div>
                <a
                  href="https://credex.rocks"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex h-10 items-center justify-center whitespace-nowrap rounded-lg bg-primary-foreground px-6 text-sm font-semibold text-primary transition-all hover:opacity-90"
                >
                  Book consultation
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </FadeIn>
        )}

        {/* Benchmark (moved up — it's compelling) */}
        <div className="mb-10">
          <BenchmarkSection
            totalMonthlySpend={totalCurrentMonthlySpend}
            teamSize={results.inputData?.teamSize ?? 1}
          />
        </div>

        {/* Per-Tool Results */}
        <section className="mb-10">
          <FadeIn>
            <h2 className="mb-5 text-lg font-bold">
              Tool-by-tool breakdown
            </h2>
          </FadeIn>
          <div className="grid gap-4 md:grid-cols-2">
            {toolResults.map((result, i) => (
              <ResultCard key={result.toolId} result={result} index={i} />
            ))}
          </div>
        </section>

        {/* Visualizations */}
        <section className="mb-10 grid gap-4 md:grid-cols-2">
          <SpendChart toolResults={toolResults} />
          <SpendDonut toolResults={toolResults} />
        </section>

        {/* Lead Capture */}
        <section className="mb-10 mx-auto max-w-lg">
          <LeadForm
            auditId={auditId}
            savingsAmount={totalMonthlySavings}
          />
        </section>

        {/* Share */}
        <FadeIn className="mb-10 text-center">
          <p className="mb-3 text-xs text-muted-foreground">
            Know someone overspending on AI tools?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <a
              href={`https://twitter.com/intent/tweet?text=I%20just%20audited%20my%20AI%20tool%20spend%20and%20found%20%24${totalMonthlySavings}%2Fmo%20in%20savings.%20Try%20it%20free%3A&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium transition-all hover:bg-muted"
            >
              <Share2 className="h-3 w-3" />
              Share on 𝕏
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-medium transition-all hover:bg-muted"
            >
              <ExternalLink className="h-3 w-3" />
              Share on LinkedIn
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={copyShareLink}
              className="rounded-lg"
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-3 w-3 text-success" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-3 w-3" />
                  Copy link
                </>
              )}
            </Button>
          </div>
        </FadeIn>

        {/* Run Another */}
        <div className="text-center">
          <Link href="/audit">
            <Button variant="outline" className="rounded-lg">
              Run another audit
            </Button>
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
