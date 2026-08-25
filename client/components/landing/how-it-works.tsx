"use client";

import { motion } from "framer-motion";
import { BarChart3, ClipboardList, FileCheck2 } from "lucide-react";
import { FadeIn, Stagger, staggerChild } from "@/components/ui/motion";

const STEPS = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Enter your stack",
    description:
      "Pick the tools your team pays for, add seats and plans, or start from a preset for common startup stacks.",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "See the spend map",
    description:
      "PromptBudget compares plan fit, overlap, benchmark ranges, and API usage patterns in seconds.",
  },
  {
    number: "03",
    icon: FileCheck2,
    title: "Share the report",
    description:
      "Get a CFO-ready breakdown with exact savings, confidence levels, and the next action to take.",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mb-14 grid gap-8 lg:grid-cols-[0.72fr_0.58fr] lg:items-end">
          <h2 className="text-4xl font-semibold leading-tight tracking-normal md:text-6xl">
            Your finance team cannot manage what it cannot see.
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            PromptBudget gives every provider, every seat, and every plan change
            the same context, so budget conversations start with evidence.
          </p>
        </FadeIn>

        <Stagger className="grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.number} variants={staggerChild} className="bg-card p-7 md:p-8">
                <div className="mb-12 flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground">{step.number}</span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </motion.div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
