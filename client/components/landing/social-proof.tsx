"use client";

import { Clock, TrendingDown, Users } from "lucide-react";
import { FadeIn, CountUp } from "@/components/ui/motion";

const STATS = [
  {
    icon: TrendingDown,
    value: 23,
    suffix: "%",
    label: "average savings found",
    detail: "from duplicate seats, plan mismatch, and API waste",
  },
  {
    icon: Clock,
    value: 90,
    suffix: "s",
    label: "average audit time",
    detail: "from first input to full recommendations",
  },
  {
    icon: Users,
    value: 40,
    suffix: "+",
    label: "pricing plans tracked",
    detail: "across subscriptions and API platforms",
  },
];

export function LandingSocialProof() {
  return (
    <section id="benchmarks" className="px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mb-12 max-w-3xl">
          <p className="mb-3 text-sm font-semibold text-muted-foreground">By the numbers</p>
          <h2 className="text-4xl font-semibold leading-tight tracking-normal md:text-6xl">
            Most teams overspend before they even notice the line item.
          </h2>
        </FadeIn>

        <FadeIn delay={0.15}>
          <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
            {STATS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-card p-8">
                  <Icon className="mb-10 h-6 w-6 text-muted-foreground" />
                  <div className="mb-2 text-6xl font-semibold tracking-normal">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mb-2 text-base font-semibold text-foreground">{stat.label}</div>
                  <div className="text-sm leading-relaxed text-muted-foreground">{stat.detail}</div>
                </div>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
