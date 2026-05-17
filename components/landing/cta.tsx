"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

export function LandingCta() {
  return (
    <section className="px-6 py-12 pb-24">
      <FadeIn>
        <div className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-primary/[0.03] p-10 text-center md:p-14">
          <h2 className="mb-3 text-2xl font-bold tracking-tight md:text-3xl">
            Stop guessing. Start saving.
          </h2>
          <p className="mb-8 text-base text-muted-foreground">
            Find out exactly what your AI stack costs — and what it should cost.
            No signup. No credit card. Just answers.
          </p>
          <Link
            href="/audit"
            className="group inline-flex h-12 items-center gap-2 rounded-xl bg-foreground px-8 text-base font-semibold text-background transition-all hover:shadow-lg hover:shadow-foreground/5"
          >
            Start your free audit
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </FadeIn>
    </section>
  );
}
