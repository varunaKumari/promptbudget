// ============================================================
// Benchmark Data — Industry averages for AI spend per developer
// Used for benchmark mode comparisons
// ============================================================

export interface BenchmarkData {
  companyStage: string;
  teamSizeRange: [number, number];
  avgSpendPerDev: number;
  medianSpendPerDev: number;
  p25SpendPerDev: number;
  p75SpendPerDev: number;
  topTools: string[];
  source: string;
}

/**
 * Industry benchmark data for AI tool spend per developer.
 * Based on aggregated public data from developer surveys,
 * SaaS spending reports, and Credex's internal data.
 *
 * These are estimates — actual figures vary by industry, geography,
 * and how "AI-native" the team is.
 */
export const BENCHMARKS: BenchmarkData[] = [
  {
    companyStage: "Solo / Freelancer",
    teamSizeRange: [1, 1],
    avgSpendPerDev: 35,
    medianSpendPerDev: 20,
    p25SpendPerDev: 10,
    p75SpendPerDev: 60,
    topTools: ["Cursor Pro", "Claude Pro", "Copilot Pro"],
    source: "Developer survey aggregates, 2025-2026",
  },
  {
    companyStage: "Pre-Seed / Seed",
    teamSizeRange: [2, 10],
    avgSpendPerDev: 55,
    medianSpendPerDev: 40,
    p25SpendPerDev: 20,
    p75SpendPerDev: 80,
    topTools: ["Cursor Pro", "Claude Pro", "ChatGPT Plus"],
    source: "Startup SaaS spending reports, 2025-2026",
  },
  {
    companyStage: "Series A",
    teamSizeRange: [11, 50],
    avgSpendPerDev: 75,
    medianSpendPerDev: 60,
    p25SpendPerDev: 35,
    p75SpendPerDev: 100,
    topTools: ["Cursor Teams", "Copilot Business", "Claude Team"],
    source: "Startup SaaS spending reports, 2025-2026",
  },
  {
    companyStage: "Series B+",
    teamSizeRange: [51, 200],
    avgSpendPerDev: 95,
    medianSpendPerDev: 80,
    p25SpendPerDev: 50,
    p75SpendPerDev: 130,
    topTools: ["Copilot Enterprise", "Cursor Teams", "ChatGPT Business"],
    source: "Enterprise SaaS spending reports, 2025-2026",
  },
  {
    companyStage: "Enterprise",
    teamSizeRange: [201, 100000],
    avgSpendPerDev: 120,
    medianSpendPerDev: 95,
    p25SpendPerDev: 60,
    p75SpendPerDev: 160,
    topTools: [
      "Copilot Enterprise",
      "ChatGPT Enterprise",
      "Claude Enterprise",
    ],
    source: "Enterprise procurement data, 2025-2026",
  },
];

/**
 * Get the benchmark data for a given team size.
 */
export function getBenchmarkForTeamSize(teamSize: number): BenchmarkData {
  const match = BENCHMARKS.find(
    (b) => teamSize >= b.teamSizeRange[0] && teamSize <= b.teamSizeRange[1]
  );
  return match || BENCHMARKS[BENCHMARKS.length - 1];
}

/**
 * Calculate the benchmark comparison for an audit result.
 */
export function calculateBenchmark(
  totalMonthlySpend: number,
  teamSize: number
): {
  spendPerDev: number;
  benchmark: BenchmarkData;
  percentile: string;
  vsMedian: number;
  vsMedianPercent: number;
  assessment: string;
} {
  const spendPerDev = teamSize > 0 ? Math.round(totalMonthlySpend / teamSize) : 0;
  const benchmark = getBenchmarkForTeamSize(teamSize);
  const vsMedian = spendPerDev - benchmark.medianSpendPerDev;
  const vsMedianPercent =
    benchmark.medianSpendPerDev > 0
      ? Math.round((vsMedian / benchmark.medianSpendPerDev) * 100)
      : 0;

  let percentile: string;
  let assessment: string;

  if (spendPerDev <= benchmark.p25SpendPerDev) {
    percentile = "Bottom 25%";
    assessment = `Your AI spend of $${spendPerDev}/dev/mo is well below the median for ${benchmark.companyStage.toLowerCase()} teams ($${benchmark.medianSpendPerDev}/dev/mo). You're either very efficient or potentially under-investing in AI tooling.`;
  } else if (spendPerDev <= benchmark.medianSpendPerDev) {
    percentile = "Below Median";
    assessment = `Your AI spend of $${spendPerDev}/dev/mo is below the median for ${benchmark.companyStage.toLowerCase()} teams ($${benchmark.medianSpendPerDev}/dev/mo). You're spending efficiently.`;
  } else if (spendPerDev <= benchmark.p75SpendPerDev) {
    percentile = "Above Median";
    assessment = `Your AI spend of $${spendPerDev}/dev/mo is above the median for ${benchmark.companyStage.toLowerCase()} teams ($${benchmark.medianSpendPerDev}/dev/mo). There may be room to optimize without sacrificing productivity.`;
  } else {
    percentile = "Top 25%";
    assessment = `Your AI spend of $${spendPerDev}/dev/mo is significantly above the median for ${benchmark.companyStage.toLowerCase()} teams ($${benchmark.medianSpendPerDev}/dev/mo). Review whether the premium tools and plans are delivering proportional value.`;
  }

  return {
    spendPerDev,
    benchmark,
    percentile,
    vsMedian,
    vsMedianPercent,
    assessment,
  };
}
