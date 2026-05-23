"use client";

import { DashboardError } from "@/components/dashboard/dashboard-error";

export default function AuditError({ reset }: { reset: () => void }) {
  return <DashboardError reset={reset} title="Audit could not load" />;
}
