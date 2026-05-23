import type { Metadata } from "next";
import {
  BarChart3,
  Building2,
  Gauge,
  LineChart,
  PieChart,
  Target,
  TrendingDown,
  Users,
} from "lucide-react";
import { FeaturePageShell } from "@/components/dashboard/feature-page-shell";

export const metadata: Metadata = {
  title: "Benchmarks",
  description: "Compare AI spend efficiency against team and industry benchmarks.",
};

export default function BenchmarksPage() {
  return (
    <FeaturePageShell
      eyebrow="Benchmarks"
      title="Compare your AI spend against modern teams."
      description="See how your subscriptions, seats, and API usage compare to startup, SMB, and scale-up spending patterns."
      ctaLabel="Start audit"
      ctaHref="/audit/start"
      metrics={[
        {
          title: "Median AI spend",
          value: "$42/seat",
          description: "Blended benchmark across coding, research, and writing tools.",
          icon: Users,
          trend: "Team comparison",
        },
        {
          title: "Efficiency score",
          value: "78%",
          description: "Cost efficiency metric normalized by team size and usage mix.",
          icon: Gauge,
          trend: "+12% vs average",
        },
        {
          title: "Industry delta",
          value: "-18%",
          description: "Typical savings available when teams consolidate overlapping plans.",
          icon: TrendingDown,
        },
        {
          title: "Best-fit range",
          value: "$28-$61",
          description: "Monthly per-seat range for teams with similar AI workflows.",
          icon: Target,
        },
      ]}
      features={[
        {
          title: "Team comparison charts",
          description: "Benchmark your team against similar headcount, stage, and AI usage intensity.",
          icon: BarChart3,
        },
        {
          title: "Industry averages",
          description: "Compare AI subscriptions and API spend across common startup operating models.",
          icon: Building2,
        },
        {
          title: "Cost efficiency metrics",
          description: "Track spend per seat, spend per workflow, and tool overlap ratios.",
          icon: PieChart,
        },
        {
          title: "Trend intelligence",
          description: "Spot budget drift before AI tooling becomes a recurring finance surprise.",
          icon: LineChart,
        },
      ]}
      tableTitle="Benchmark snapshot"
      tableDescription="Representative planning data shown until you run a live audit."
      tableHeaders={["Segment", "Team size", "Monthly AI spend", "Efficiency range"]}
      tableRows={[
        ["Seed engineering", "3-10", "$180-$850", "72-88%"],
        ["Series A product", "10-40", "$900-$4.8k", "64-82%"],
        ["Agency / services", "5-30", "$420-$3.1k", "58-79%"],
        ["AI-native startup", "8-60", "$1.4k-$12k", "61-84%"],
      ]}
      emptyTitle="No live benchmark profile yet"
      emptyDescription="Run an audit to replace placeholder benchmarks with a comparison calibrated to your team size, use case, and selected vendors."
    />
  );
}
