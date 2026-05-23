"use client";

import { DashboardError } from "@/components/dashboard/dashboard-error";

export default function PricingError({ reset }: { reset: () => void }) {
  return <DashboardError reset={reset} title="Pricing data could not load" />;
}
