"use client";

import { DashboardError } from "@/components/dashboard/dashboard-error";

export default function BenchmarksError({ reset }: { reset: () => void }) {
  return <DashboardError reset={reset} title="Benchmarks could not load" />;
}
