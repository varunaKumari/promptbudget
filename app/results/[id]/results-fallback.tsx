"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import type { AuditResult } from "@/lib/types";
import { ResultsClient } from "./results-client";

interface ResultsFallbackProps {
  auditId: string;
}

/**
 * Client-side fallback component that reads audit results from sessionStorage
 * when Supabase is unavailable (e.g., tables not yet created).
 */
export function ResultsFallback({ auditId }: ResultsFallbackProps) {
  const [results, setResults] = useState<AuditResult | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const cached = sessionStorage.getItem(`audit_${auditId}`);
        if (cached) {
          const parsed = JSON.parse(cached) as AuditResult;
          parsed.id = auditId;
          setResults(parsed);
        }
      } catch {
        // Ignore parse errors
      }
      setChecked(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [auditId]);

  // Still loading
  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading your audit results...</p>
        </div>
      </div>
    );
  }

  // Found cached results
  if (results) {
    return <ResultsClient results={results} auditId={auditId} />;
  }

  // No data — 404 state
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 text-7xl font-black text-muted-foreground/15 font-tabular">
        404
      </div>
      <h1 className="mb-2 text-xl font-bold">Audit not found</h1>
      <p className="mb-8 max-w-sm text-sm text-muted-foreground">
        This audit report doesn&apos;t exist or has expired. Run a new
        audit to get fresh savings recommendations.
      </p>
      <Link
        href="/audit"
        className="group inline-flex h-10 items-center rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90"
      >
        Start new audit
        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
