"use client";

import type { ToolAuditResult } from "@/lib/types";

interface SpendChartProps {
  toolResults: ToolAuditResult[];
}

/**
 * Visual bar chart comparing current vs. optimized spend per tool.
 * Pure CSS — no chart library needed.
 */
export function SpendChart({ toolResults }: SpendChartProps) {
  const maxSpend = Math.max(...toolResults.map((r) => r.currentMonthlySpend), 1);

  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">📊</span>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Spend Comparison
        </h2>
      </div>
      <p className="mb-6 text-xs text-muted-foreground">
        Current spend vs. optimized spend per tool
      </p>

      <div className="space-y-5">
        {toolResults.map((result) => {
          const currentWidth = (result.currentMonthlySpend / maxSpend) * 100;
          const optimized =
            result.topRecommendation?.type !== "optimal"
              ? result.topRecommendation?.newMonthlySpend ?? result.currentMonthlySpend
              : result.currentMonthlySpend;
          const optimizedWidth = (optimized / maxSpend) * 100;
          const hasSavings = optimized < result.currentMonthlySpend;

          return (
            <div key={result.toolId}>
              {/* Tool label */}
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <span>{result.toolIcon}</span>
                  {result.toolName}
                </span>
                <span className="text-sm text-muted-foreground">
                  ${result.currentMonthlySpend.toLocaleString()}/mo
                  {hasSavings && (
                    <span className="ml-2 text-emerald-600 dark:text-emerald-400">
                      → ${optimized.toLocaleString()}
                    </span>
                  )}
                </span>
              </div>

              {/* Bar: current */}
              <div className="relative mb-1">
                <div className="h-6 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground/20 transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(currentWidth, 2)}%` }}
                  />
                </div>
                {/* Optimized bar overlay */}
                {hasSavings && (
                  <div className="absolute inset-0">
                    <div className="h-6 w-full overflow-hidden rounded-full">
                      <div
                        className="h-full rounded-full bg-emerald-500/40 transition-all duration-1000 ease-out"
                        style={{ width: `${Math.max(optimizedWidth, 2)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-foreground/20" />
          Current spend
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-emerald-500/40" />
          Optimized spend
        </div>
      </div>
    </div>
  );
}

/**
 * Donut chart showing spend distribution by tool.
 * Pure CSS — no chart library.
 */
export function SpendDonut({ toolResults }: SpendChartProps) {
  const total = toolResults.reduce((sum, r) => sum + r.currentMonthlySpend, 0);
  if (total === 0) return null;

  const colors = [
    "hsl(210, 80%, 55%)",
    "hsl(160, 60%, 45%)",
    "hsl(35, 85%, 55%)",
    "hsl(280, 60%, 55%)",
    "hsl(350, 70%, 55%)",
    "hsl(180, 50%, 45%)",
    "hsl(50, 75%, 50%)",
    "hsl(120, 50%, 45%)",
  ];

  // Build conic gradient segments
  let accumulated = 0;
  const segments = toolResults.map((r, i) => {
    const pct = (r.currentMonthlySpend / total) * 100;
    const start = accumulated;
    accumulated += pct;
    return { ...r, pct, start, end: accumulated, color: colors[i % colors.length] };
  });

  const gradient = segments
    .map((s) => `${s.color} ${s.start}% ${s.end}%`)
    .join(", ");

  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">🍩</span>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Spend Distribution
        </h2>
      </div>

      <div className="flex flex-col items-center gap-6 sm:flex-row">
        {/* Donut */}
        <div className="relative h-48 w-48 shrink-0">
          <div
            className="h-full w-full rounded-full"
            style={{ background: `conic-gradient(${gradient})` }}
          />
          {/* Inner circle for donut hole */}
          <div className="absolute inset-6 flex items-center justify-center rounded-full bg-card">
            <div className="text-center">
              <div className="text-xl font-bold">${total.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">/month</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2">
          {segments.map((s) => (
            <div key={s.toolId} className="flex items-center gap-3">
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-sm text-foreground">
                {s.toolIcon} {s.toolName}
              </span>
              <span className="text-sm text-muted-foreground">
                ${s.currentMonthlySpend.toLocaleString()} ({Math.round(s.pct)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
