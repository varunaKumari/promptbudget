"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { FadeIn, SlideUp, CountUp } from "@/components/ui/motion";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-24 md:pt-28 md:pb-32">
      {/* Dot grid background */}
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-40" />
      {/* Gradient glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/[0.04] blur-3xl" />

      <div className="relative mx-auto max-w-4xl">
        <FadeIn className="mb-8 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-sm">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Free tool — no login required
          </span>
        </FadeIn>

        <SlideUp delay={0.1} className="text-center">
          <h1 className="mb-6 text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl lg:text-7xl">
            Your team is overspending
            <br />
            <span className="text-primary">
              on AI tools
            </span>
          </h1>
        </SlideUp>

        <FadeIn delay={0.25} className="text-center">
          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Most startups waste 20-40% on AI subscriptions — wrong plans, duplicate tools,
            unused seats. PromptBudget finds the waste in 2 minutes and tells you exactly
            what to change.
          </p>
        </FadeIn>

        <FadeIn delay={0.4} className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/audit"
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-foreground px-7 text-base font-semibold text-background transition-all hover:shadow-lg hover:shadow-foreground/5"
          >
            Audit my AI spend
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <span className="text-sm text-muted-foreground">
            Takes 2 minutes · Free forever
          </span>
        </FadeIn>

        {/* Social proof strip */}
        <FadeIn delay={0.6} className="mt-16 text-center">
          <div className="inline-flex items-center gap-6 rounded-xl border border-border bg-card/50 px-6 py-3 shadow-sm">
            <div className="text-center">
              <div className="text-lg font-bold font-tabular text-foreground">
                <CountUp value={2847} />
              </div>
              <div className="text-xs text-muted-foreground">audits run</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-lg font-bold font-tabular text-foreground">
                <CountUp value={23} suffix="%" />
              </div>
              <div className="text-xs text-muted-foreground">avg savings found</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="text-lg font-bold font-tabular text-foreground">
                $<CountUp value={340} />
              </div>
              <div className="text-xs text-muted-foreground">avg monthly savings</div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
