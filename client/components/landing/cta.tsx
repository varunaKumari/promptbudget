"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

export function LandingCta() {
  return (
    <section className="px-5 py-24 md:px-8">
      <FadeIn>
        <div className="mx-auto max-w-7xl overflow-hidden rounded-lg border border-border bg-foreground text-background">
          <div className="grid gap-8 p-8 md:grid-cols-[0.8fr_0.4fr] md:items-end md:p-12">
            <div>
              <p className="mb-4 text-sm font-semibold text-background/60">
                Ready when the budget review is not.
              </p>
              <h2 className="max-w-4xl text-4xl font-semibold leading-tight tracking-normal md:text-6xl">
                Stop guessing what your AI stack should cost.
              </h2>
            </div>
            <div>
              <p className="mb-6 text-base leading-relaxed text-background/68">
                Run the free audit and get a shareable report with exact savings opportunities.
              </p>
              <Link
                href="/audit"
                className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
              >
                Start your free audit
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
