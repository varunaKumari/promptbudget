import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  trend?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: MetricCardProps) {
  return (
    <article className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg hover:shadow-foreground/5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal sm:text-3xl">
            {value}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-200 group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted-foreground">{description}</p>
      {trend && (
        <p className="mt-4 inline-flex rounded-full bg-primary/15 px-2.5 py-1 text-xs font-semibold text-foreground">
          {trend}
        </p>
      )}
    </article>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-dashed border-border bg-muted/35 p-6 text-center",
        className
      )}
      aria-live="polite"
    >
      <p className="text-base font-semibold">{title}</p>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </section>
  );
}

export function LoadingRows() {
  return (
    <div className="space-y-3" aria-label="Loading" role="status">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-14 animate-pulse rounded-lg bg-muted"
        />
      ))}
    </div>
  );
}
