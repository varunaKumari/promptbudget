"use client";

import { DashboardError } from "@/components/dashboard/dashboard-error";

export default function ReportsError({ reset }: { reset: () => void }) {
  return <DashboardError reset={reset} title="Reports could not load" />;
}
