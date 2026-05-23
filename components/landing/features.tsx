"use client";

import { motion } from "framer-motion";
import { Brain, CreditCard, Lightbulb, Search, Share2, Shield } from "lucide-react";
import { FadeIn, Stagger, staggerChild } from "@/components/ui/motion";

const FEATURES = [
  {
    icon: Search,
    title: "Instant spend analysis",
    description: "Break down every AI subscription and API bill into plan fit, overlap, and usage risk.",
  },
  {
    icon: Lightbulb,
    title: "Actionable recommendations",
    description: "Get specific plan changes and tool swaps with dollar amounts attached.",
  },
  {
    icon: Shield,
    title: "Defensible pricing",
    description: "Recommendations are grounded in vendor pricing and transparent audit math.",
  },
  {
    icon: Share2,
    title: "Shareable reports",
    description: "Each audit produces a clean URL for finance, founders, or budget owners.",
  },
  {
    icon: Brain,
    title: "AI-powered summary",
    description: "Turn the raw audit into a plain-English executive summary.",
  },
  {
    icon: CreditCard,
    title: "Credit opportunities",
    description: "High-waste teams can explore discounted AI infrastructure credits through Credex.",
  },
];

function ReportPreview() {
  return (
    <div className="flat-card overflow-hidden rounded-lg">
      <div className="border-b border-border bg-surface px-5 py-4">
        <p className="text-sm font-semibold">Spend allocation</p>
      </div>
      <div className="grid gap-6 p-5 md:grid-cols-[1fr_260px] md:p-7">
        <div>
          <div className="mb-6 h-56 rounded-md border border-border bg-card p-5">
            <div className="flex h-full items-end gap-3">
              {[42, 55, 48, 72, 68, 88].map((height, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t bg-foreground/80" style={{ height: `${height}%` }} />
                  <span className="text-[10px] text-muted-foreground">M{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {["Anthropic", "OpenAI", "Coding tools"].map((label, index) => (
              <div key={label} className="rounded-md bg-surface p-4">
                <p className="mb-2 text-xs text-muted-foreground">{label}</p>
                <p className="text-xl font-semibold">{["$930", "$1,860", "$760"][index]}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-md bg-primary p-5 text-primary-foreground">
          <p className="mb-10 text-xs font-semibold uppercase tracking-[0.16em]">Recommended</p>
          <h3 className="mb-3 text-3xl font-semibold leading-tight">Save $1,140 this month</h3>
          <p className="text-sm leading-relaxed opacity-80">
            Switch API traffic to cheaper models, remove duplicate editor seats,
            and downgrade underused team plans.
          </p>
        </div>
      </div>
    </div>
  );
}

export function LandingFeatures() {
  return (
    <section id="features" className="bg-surface px-5 py-24 md:px-8">
      <div className="mx-auto max-w-7xl">
        <FadeIn className="mb-12 grid gap-8 lg:grid-cols-[0.6fr_0.6fr] lg:items-end">
          <div>
            <p className="mb-3 text-sm font-semibold text-muted-foreground">Product visibility</p>
            <h2 className="text-4xl font-semibold leading-tight tracking-normal md:text-6xl">
              One place for every provider, every model, every dollar.
            </h2>
          </div>
          <p className="text-lg leading-relaxed text-muted-foreground">
            The report reads like a finance artifact and behaves like an
            engineering tool: fast, specific, and easy to act on.
          </p>
        </FadeIn>

        <FadeIn className="mb-10">
          <ReportPreview />
        </FadeIn>

        <Stagger className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={staggerChild} className="group bg-card p-6 transition-colors hover:bg-accent/35">
                <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-md bg-surface text-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
