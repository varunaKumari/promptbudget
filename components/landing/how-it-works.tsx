"use client";

import { motion } from "framer-motion";
import { Plus, BarChart3, Download } from "lucide-react";
import { FadeIn, Stagger, staggerChild } from "@/components/ui/motion";

const STEPS = [
  {
    number: "01",
    icon: Plus,
    title: "Add your tools",
    description:
      "Select your AI subscriptions, plans, and team size. Or pick a preset — we'll fill in common stacks for you.",
    accent: "bg-primary/10 text-primary",
  },
  {
    number: "02",
    icon: BarChart3,
    title: "Get your audit",
    description:
      "Our engine compares every tool against alternatives, checks plan fit, flags overlaps, and calculates savings — in under 3 seconds.",
    accent: "bg-success/10 text-success",
  },
  {
    number: "03",
    icon: Download,
    title: "Act on it",
    description:
      "Get a shareable report with an AI Spend Score, specific recommendations with dollar amounts, and a link to share with your CFO.",
    accent: "bg-warning/10 text-warning",
  },
];

export function LandingHowItWorks() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <FadeIn className="mb-16">
          <p className="mb-3 text-sm font-medium text-primary">How it works</p>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Three steps. Two minutes.
            <br />
            <span className="text-muted-foreground">Real numbers.</span>
          </h2>
        </FadeIn>

        <Stagger className="grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <motion.div key={step.number} variants={staggerChild} className="group relative">
                {/* Step number — subtle background element */}
                <div className="absolute -top-2 -left-1 text-7xl font-black text-muted/80 select-none transition-colors group-hover:text-primary/10">
                  {step.number}
                </div>
                <div className="relative pt-10">
                  <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg ${step.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
