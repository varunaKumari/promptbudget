"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  }, [auditId]);

  // Still loading
  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          <p className="text-muted-foreground">Loading your audit results...</p>
        </div>
      </div>
    );
  }

  // Found cached results — render them
  if (results) {
    return <ResultsClient results={results} auditId={auditId} />;
  }

  // No data anywhere — show 404
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-8xl font-black text-muted-foreground/20">
        404
      </div>
      <h1 className="mb-3 text-2xl font-bold">Audit Not Found</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        This audit report doesn&apos;t exist or has expired. Run a new
        audit to get fresh savings recommendations.
      </p>
      <Link
        href="/audit"
        className="inline-flex h-12 items-center rounded-full bg-foreground px-8 font-medium text-background transition-all hover:opacity-90 hover:scale-105"
      >
        Start New Audit →
      </Link>
    </div>
  );
}
