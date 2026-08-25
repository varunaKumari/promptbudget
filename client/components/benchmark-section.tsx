"use client";

import { calculateBenchmark } from "@/lib/benchmarks";
import { FadeIn } from "@/components/ui/motion";
import { BarChart3, ArrowUp, ArrowDown } from "lucide-react";

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

  const maxVal = benchmark.p75SpendPerDev * 1.5;
  const medPos = (benchmark.medianSpendPerDev / maxVal) * 100;
  const p75Pos = (benchmark.p75SpendPerDev / maxVal) * 100;
  const userPos = Math.min((spendPerDev / maxVal) * 100, 98);

  const isOverMedian = vsMedian > 0;

  return (
    <FadeIn>
      <div className="flat-card rounded-lg p-6">
        <div className="mb-1 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Benchmark Comparison
          </h2>
        </div>
        <p className="mb-6 text-[11px] text-muted-foreground">
          How your AI spend compares to {benchmark.companyStage.toLowerCase()}{" "}
          teams ({benchmark.teamSizeRange[0]}–{benchmark.teamSizeRange[1]} devs)
        </p>

        {/* Main stat */}
        <div className="mb-6 text-center">
          <div className="mb-1 text-4xl font-bold font-tabular tracking-tight">
            ${spendPerDev}
            <span className="text-base font-normal text-muted-foreground">
              /dev/mo
            </span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                isOverMedian
                  ? "bg-warning/10 text-warning"
                  : "bg-success/10 text-success"
              }`}
            >
              {isOverMedian ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              {Math.abs(vsMedianPercent)}% vs median
            </span>
            <span className="text-xs text-muted-foreground">({percentile})</span>
          </div>
        </div>

        {/* Visual benchmark bar */}
        <div className="relative mb-6">
          <div className="relative h-8 w-full overflow-hidden rounded-sm bg-muted">
            {/* Zones */}
            <div
              className="absolute inset-y-0 left-0 rounded-l-sm bg-success/15"
              style={{ width: `${medPos}%` }}
            />
            <div
              className="absolute inset-y-0 bg-warning/15"
              style={{ left: `${medPos}%`, width: `${p75Pos - medPos}%` }}
            />
            <div
              className="absolute inset-y-0 right-0 rounded-r-sm bg-danger/10"
              style={{ left: `${p75Pos}%` }}
            />

            {/* User position marker */}
            <div
              className="absolute top-1/2 z-10 -translate-y-1/2 transition-all duration-700"
              style={{ left: `${userPos}%` }}
            >
              <div className="flex flex-col items-center">
                <div className="h-8 w-0.5 rounded-full bg-foreground shadow-sm" />
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="mt-1.5 flex justify-between text-[10px] text-muted-foreground">
            <span>${benchmark.p25SpendPerDev} (p25)</span>
            <span className="font-medium">
              Median: ${benchmark.medianSpendPerDev}
            </span>
            <span>${benchmark.p75SpendPerDev} (p75)</span>
          </div>
        </div>

        {/* Assessment text */}
        <p className="text-xs leading-relaxed text-muted-foreground">
          {comparison.assessment}
        </p>

        {/* Common tools */}
        <div className="mt-5 border-t border-border pt-4">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Common tools at {benchmark.companyStage.toLowerCase()} stage
          </p>
          <div className="flex flex-wrap gap-1.5">
            {benchmark.topTools.map((tool) => (
              <span
                key={tool}
                className="rounded-md bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
