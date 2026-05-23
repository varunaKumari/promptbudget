"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { FadeIn, SlideUp, CountUp } from "@/components/ui/motion";

const heroRows = [
  { tool: "Cursor Teams", seats: 18, spend: "$720", status: "Duplicate seats" },
  { tool: "Claude Team", seats: 14, spend: "$420", status: "Plan mismatch" },
  { tool: "ChatGPT Business", seats: 22, spend: "$550", status: "Shared usage" },
  { tool: "OpenAI API", seats: 1, spend: "$1,860", status: "Model routing" },
];

function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-6xl">
      <div className="flat-card overflow-hidden rounded-lg bg-card">
        <div className="flex h-12 items-center justify-between border-b border-border bg-surface px-5">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
            <span className="h-2.5 w-2.5 rounded-full bg-border" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">PromptBudget report</span>
          <span className="rounded bg-primary px-2 py-1 text-[10px] font-semibold text-primary-foreground">
            Live audit
          </span>
        </div>
        <div className="grid min-h-[420px] lg:grid-cols-[250px_1fr]">
          <aside className="hidden border-r border-border bg-surface/70 p-5 lg:block">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Spend controls
            </p>
            {["Overview", "Subscriptions", "API usage", "Recommendations"].map((item, index) => (
              <div
                key={item}
                className={`mb-2 rounded-md px-3 py-2 text-sm ${
                  index === 0 ? "bg-card font-semibold text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {item}
              </div>
            ))}
          </aside>
          <div className="p-5 md:p-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  AI spend overview
                </p>
                <h3 className="text-3xl font-semibold tracking-normal md:text-4xl">$3,550/mo</h3>
              </div>
              <div className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Save up to $1,140
              </div>
            </div>
            <div className="mb-8 grid gap-3 md:grid-cols-3">
              {[
                ["Waste found", "$1,140"],
                ["Plan overlap", "31%"],
                ["Tools tracked", "10"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-md border border-border bg-surface p-4">
                  <p className="mb-3 text-xs text-muted-foreground">{label}</p>
                  <p className="text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="overflow-hidden rounded-md border border-border">
              {heroRows.map((row) => (
                <div
                  key={row.tool}
                  className="grid grid-cols-[1fr_70px_90px] gap-3 border-b border-border px-4 py-3 text-sm last:border-b-0 md:grid-cols-[1fr_90px_110px_150px]"
                >
                  <span className="font-medium">{row.tool}</span>
                  <span className="text-muted-foreground">{row.seats}</span>
                  <span className="font-tabular font-semibold">{row.spend}</span>
                  <span className="hidden text-muted-foreground md:block">{row.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-5 right-8 hidden rounded-lg border border-border bg-card p-5 shadow-xl md:block">
        <p className="mb-1 text-xs text-muted-foreground">Recommended next action</p>
        <p className="text-sm font-semibold">Downgrade 8 unused seats</p>
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-70" />
      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-16 md:px-8 md:pb-24 md:pt-24">
        <FadeIn className="mb-8 inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-sm">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          Free AI spend audit, no login required
        </FadeIn>

        <div className="grid gap-10 lg:grid-cols-[0.86fr_0.54fr] lg:items-end">
          <SlideUp>
            <h1 className="max-w-5xl text-5xl font-semibold leading-[0.98] tracking-normal md:text-7xl lg:text-8xl">
              AI spend is growing. Make every dollar explainable.
            </h1>
          </SlideUp>
          <FadeIn delay={0.16}>
            <p className="mb-7 max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
              PromptBudget finds duplicate seats, wrong plans, and API waste across
              your AI stack, then turns it into a shareable savings report.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/audit"
                className="inline-flex h-14 items-center justify-center whitespace-nowrap rounded-md bg-primary px-7 text-base font-semibold text-primary-foreground transition-all hover:bg-primary/90 lime-shadow"
              >
                Audit my AI spend
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <div className="flex h-14 items-center rounded-md border border-border bg-card px-5 text-sm text-muted-foreground">
                Takes 2 minutes. Built for engineering teams.
              </div>
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.28} className="mt-14">
          <DashboardMockup />
        </FadeIn>

        <FadeIn delay={0.38} className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {[
            ["2,847", "audits run"],
            ["23%", "average savings found"],
            ["$340", "average monthly savings"],
          ].map(([value, label]) => (
            <div key={label} className="bg-card p-6">
              <p className="text-4xl font-semibold tracking-normal">
                {value === "2,847" ? <CountUp value={2847} /> : value}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </FadeIn>
      </div>
    </section>
  );
}
