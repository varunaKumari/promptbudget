"use client";

import { calculateBenchmark } from "@/lib/benchmarks";

interface BenchmarkSectionProps {
  totalMonthlySpend: number;
  teamSize: number;
}

export function BenchmarkSection({
  totalMonthlySpend,
  teamSize,
}: BenchmarkSectionProps) {
  const comparison = calculateBenchmark(totalMonthlySpend, teamSize);
  const { spendPerDev, benchmark, percentile, vsMedian, vsMedianPercent } =
    comparison;

  // Calculate bar positions for the visualization
  const maxVal = benchmark.p75SpendPerDev * 1.5;
  const p25Pos = (benchmark.p25SpendPerDev / maxVal) * 100;
  const medPos = (benchmark.medianSpendPerDev / maxVal) * 100;
  const p75Pos = (benchmark.p75SpendPerDev / maxVal) * 100;
  const userPos = Math.min((spendPerDev / maxVal) * 100, 98);

  const isOverMedian = vsMedian > 0;

  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">📏</span>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Benchmark Comparison
        </h2>
      </div>
      <p className="mb-6 text-xs text-muted-foreground">
        How your AI spend compares to {benchmark.companyStage.toLowerCase()}{" "}
        teams ({benchmark.teamSizeRange[0]}–{benchmark.teamSizeRange[1]} devs)
      </p>

      {/* Main stat */}
      <div className="mb-8 text-center">
        <div className="mb-1 text-5xl font-black tracking-tight">
          ${spendPerDev}
          <span className="text-lg font-normal text-muted-foreground">
            /dev/mo
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              isOverMedian
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isOverMedian ? "↑" : "↓"} {Math.abs(vsMedianPercent)}% vs
            median
          </span>
          <span className="text-sm text-muted-foreground">({percentile})</span>
        </div>
      </div>

      {/* Visual benchmark bar */}
      <div className="relative mb-8">
        <div className="relative h-10 w-full overflow-hidden rounded-full bg-muted">
          {/* Green zone: below median */}
          <div
            className="absolute inset-y-0 left-0 rounded-l-full bg-emerald-500/20"
            style={{ width: `${medPos}%` }}
          />
          {/* Amber zone: above median */}
          <div
            className="absolute inset-y-0 bg-amber-500/20"
            style={{ left: `${medPos}%`, width: `${p75Pos - medPos}%` }}
          />
          {/* Red zone: top 25% */}
          <div
            className="absolute inset-y-0 right-0 rounded-r-full bg-red-500/10"
            style={{ left: `${p75Pos}%` }}
          />

          {/* User position marker */}
          <div
            className="absolute top-1/2 z-10 -translate-y-1/2 transition-all duration-700"
            style={{ left: `${userPos}%` }}
          >
            <div className="flex flex-col items-center">
              <div className="h-10 w-1 rounded-full bg-foreground shadow-lg" />
            </div>
          </div>
        </div>

        {/* Labels */}
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>${benchmark.p25SpendPerDev}</span>
          <span className="font-medium">
            Median: ${benchmark.medianSpendPerDev}
          </span>
          <span>${benchmark.p75SpendPerDev}</span>
        </div>
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>p25</span>
          <span>p50</span>
          <span>p75</span>
        </div>
      </div>

      {/* Assessment text */}
      <p className="text-sm leading-relaxed text-muted-foreground">
        {comparison.assessment}
      </p>

      {/* Common tools at this stage */}
      <div className="mt-6 border-t border-border pt-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Most used tools at {benchmark.companyStage.toLowerCase()} stage:
        </p>
        <div className="flex flex-wrap gap-2">
          {benchmark.topTools.map((tool) => (
            <span
              key={tool}
              className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
