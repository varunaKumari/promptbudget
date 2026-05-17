"use client";

import { motion } from "framer-motion";
import {
  Search,
  Lightbulb,
  Shield,
  Share2,
  Brain,
  CreditCard,
} from "lucide-react";
import { FadeIn, Stagger, staggerChild } from "@/components/ui/motion";

const FEATURES = [
  {
    icon: Search,
    title: "Instant spend analysis",
    description:
      "A detailed breakdown of where every dollar goes — and where it shouldn't. We check every plan tier against your actual usage.",
  },
  {
    icon: Lightbulb,
    title: "Actionable recommendations",
    description:
      "Specific plan changes, tool swaps, and savings with dollar amounts and reasoning you can show your CFO.",
  },
  {
    icon: Shield,
    title: "Defensible numbers",
    description:
      "Every recommendation cites current vendor pricing. The math is transparent, the logic is auditable, the sources are linked.",
  },
  {
    icon: Share2,
    title: "Shareable reports",
    description:
      "Each audit gets a unique URL with clean previews on Twitter and Slack. Share it in your next budget review.",
  },
  {
    icon: Brain,
    title: "AI-powered insights",
    description:
      "A personalized summary of your spend patterns written by Claude, grounded in your actual numbers — not generic advice.",
  },
  {
    icon: CreditCard,
    title: "Credex savings",
    description:
      "For teams with significant overspend, unlock additional savings through Credex's discounted AI infrastructure credits.",
  },
];

export function LandingFeatures() {
  return (
    <section className="relative bg-surface px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <FadeIn className="mb-16 max-w-2xl">
          <p className="mb-3 text-sm font-medium text-primary">Features</p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Not another dashboard.
          </h2>
          <p className="text-base text-muted-foreground">
            A tool that tells you what to do and why — with the numbers to back it up.
            Built for engineering leaders who need to justify spend to finance.
          </p>
        </FadeIn>

        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                variants={staggerChild}
                className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/20 hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8 text-primary transition-colors group-hover:bg-primary/12">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
