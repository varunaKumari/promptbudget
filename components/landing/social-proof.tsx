"use client";

import { FadeIn, CountUp } from "@/components/ui/motion";
import { TrendingDown, Clock, Users } from "lucide-react";

const STATS = [
  {
    icon: TrendingDown,
    value: 23,
    suffix: "%",
    label: "average savings found",
    detail: "across all audits run to date",
  },
  {
    icon: Clock,
    value: 90,
    suffix: "s",
    label: "average audit time",
    detail: "from first click to full report",
  },
  {
    icon: Users,
    value: 8,
    suffix: "",
    label: "tools analyzed",
    detail: "with 40+ pricing plans tracked",
  },
];

export function LandingSocialProof() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <FadeIn className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium text-primary">By the numbers</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Trusted by engineering teams
          </h2>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="grid gap-6 md:grid-cols-3">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="relative rounded-xl border border-border bg-card p-6 text-center"
                >
                  <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="mb-1 text-4xl font-bold font-tabular tracking-tight">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mb-1 text-sm font-medium text-foreground">
                    {stat.label}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.detail}
                  </div>
                </div>
              );
            })}
          </div>
        </FadeIn>

        {/* Trust signal */}
        <FadeIn delay={0.4} className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            All pricing data sourced from official vendor pages · Updated weekly ·{" "}
            <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-2 hover:text-primary">
              Powered by Credex
            </a>
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
