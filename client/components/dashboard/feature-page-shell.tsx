import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { MetricCard, EmptyState } from "./metric-card";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface Metric {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: string;
}

interface FeaturePageShellProps {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  metrics: Metric[];
  features: Feature[];
  tableTitle: string;
  tableDescription: string;
  tableHeaders: string[];
  tableRows: string[][];
  emptyTitle: string;
  emptyDescription: string;
}

export function FeaturePageShell({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  metrics,
  features,
  tableTitle,
  tableDescription,
  tableHeaders,
  tableRows,
  emptyTitle,
  emptyDescription,
}: FeaturePageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-5 py-8 sm:px-6 md:py-12 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {eyebrow}
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-normal sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {description}
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-medium">Ready to inspect your stack?</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Start with a free audit and turn this dashboard into live recommendations.
            </p>
            <Button asChild size="lg" className="mt-2 w-full sm:w-fit">
              <Link href={ctaHref}>
                {ctaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label={`${eyebrow} metrics`}
        >
          {metrics.map((metric) => (
            <MetricCard key={metric.title} {...metric} />
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-accent/20 focus-within:ring-2 focus-within:ring-ring"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-200 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </section>

        <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-2 border-b border-border p-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-normal">{tableTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{tableDescription}</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/audit/start">Refresh data</Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <tr>
                  {tableHeaders.map((header) => (
                    <th key={header} scope="col" className="px-5 py-3 font-semibold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tableRows.map((row) => (
                  <tr key={row.join("-")} className="transition-colors hover:bg-muted/35">
                    {row.map((cell, index) => (
                      <td
                        key={`${cell}-${index}`}
                        className="px-5 py-4 text-muted-foreground first:font-medium first:text-foreground"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={
            <Button variant="outline" asChild>
              <Link href="/audit/start">Run a live audit</Link>
            </Button>
          }
        />
      </main>
    </div>
  );
}
