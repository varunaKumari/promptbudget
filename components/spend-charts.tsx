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
    <div className="flat-card rounded-lg p-6">
      <div className="mb-1 flex items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Spend Comparison
        </h2>
      </div>
      <p className="mb-5 text-[11px] text-muted-foreground">
        Current vs. optimized spend per tool
      </p>

      <div className="space-y-4">
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
              <div className="mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <span className="text-sm">{result.toolIcon}</span>
                  {result.toolName}
                </span>
                <span className="text-xs font-tabular text-muted-foreground">
                  ${result.currentMonthlySpend.toLocaleString()}
                  {hasSavings && (
                    <span className="ml-1.5 text-success">
                      → ${optimized.toLocaleString()}
                    </span>
                  )}
                </span>
              </div>

              <div className="relative mb-0.5">
                <div className="h-5 w-full overflow-hidden rounded-sm bg-muted">
                  <div
                    className="h-full rounded-sm bg-foreground/20 transition-all duration-700 ease-out"
                    style={{ width: `${Math.max(currentWidth, 3)}%` }}
                  />
                </div>
                {hasSavings && (
                  <div className="absolute inset-0">
                    <div className="h-5 w-full overflow-hidden rounded-sm">
                      <div
                        className="h-full rounded-sm bg-success/30 transition-all duration-1000 ease-out"
                        style={{ width: `${Math.max(optimizedWidth, 3)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex items-center gap-5 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-foreground/15" />
          Current
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded bg-success/30" />
          Optimized
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

  // Brand-aligned colors using oklch for consistency
  const colors = [
    "oklch(0.86 0.22 127)",
    "oklch(0.58 0.12 220)",
    "oklch(0.68 0.13 35)",
    "oklch(0.55 0.10 285)",
    "oklch(0.66 0.12 170)",
    "oklch(0.74 0.12 75)",
    "oklch(0.50 0.10 25)",
    "oklch(0.62 0.10 310)",
  ];

  const segments = toolResults.reduce<(ToolAuditResult & {
    pct: number;
    start: number;
    end: number;
    color: string;
  })[]>((items, r, i) => {
    const pct = (r.currentMonthlySpend / total) * 100;
    const start = items[i - 1]?.end ?? 0;
    return [
      ...items,
      { ...r, pct, start, end: start + pct, color: colors[i % colors.length] },
    ];
  }, []);

  const gradient = segments
    .map((s) => `${s.color} ${s.start}% ${s.end}%`)
    .join(", ");

  return (
    <div className="flat-card rounded-lg p-6">
      <div className="mb-1">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Spend Distribution
        </h2>
      </div>

      <div className="flex flex-col items-center gap-5 sm:flex-row">
        {/* Donut */}
        <div className="relative h-40 w-40 shrink-0">
          <div
            className="h-full w-full rounded-full"
            style={{ background: `conic-gradient(${gradient})` }}
          />
          <div className="absolute inset-5 flex items-center justify-center rounded-full bg-card">
            <div className="text-center">
              <div className="text-lg font-bold font-tabular">${total.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground">/month</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-1.5">
          {segments.map((s) => (
            <div key={s.toolId} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 shrink-0 rounded"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-xs text-muted-foreground">
                {s.toolName}
              </span>
              <span className="text-xs font-tabular text-muted-foreground">
                ${s.currentMonthlySpend.toLocaleString()} ({Math.round(s.pct)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
