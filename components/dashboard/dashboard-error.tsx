"use client";

import { RefreshCcw } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";

export function DashboardError({
  reset,
  title = "This dashboard could not load",
}: {
  reset: () => void;
  title?: string;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-5 py-12 sm:px-6 lg:px-8">
        <section className="max-w-md rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-danger/10 text-danger">
            <RefreshCcw className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Please retry. If the issue continues, start a new audit to refresh the dashboard data.
          </p>
          <Button type="button" onClick={reset} className="mt-6">
            Try again
          </Button>
        </section>
      </main>
    </div>
  );
}
