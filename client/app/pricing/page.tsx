import type { Metadata } from "next";
import {
  BadgeDollarSign,
  CalendarClock,
  RefreshCcw,
  ShieldCheck,
  Table2,
  Tags,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { FeaturePageShell } from "@/components/dashboard/feature-page-shell";

export const metadata: Metadata = {
  title: "Pricing data",
  description: "Compare AI vendor pricing, subscriptions, and plan history.",
};

export default function PricingPage() {
  return (
    <FeaturePageShell
      eyebrow="Pricing data"
      title="Track vendor pricing before it surprises your budget."
      description="Review subscription comparisons, plan changes, and pricing history across the AI tools your team depends on."
      ctaLabel="Compare your plans"
      ctaHref="/audit/start"
      metrics={[
        {
          title: "Vendors tracked",
          value: "25+",
          description: "Common AI subscriptions, coding assistants, and model APIs.",
          icon: Tags,
          trend: "Updated regularly",
        },
        {
          title: "Plan range",
          value: "$10-$200",
          description: "Typical per-seat monthly pricing range for modern AI tools.",
          icon: Wallet,
        },
        {
          title: "API changes",
          value: "Tracked",
          description: "Model and token pricing changes captured for planning reviews.",
          icon: TrendingUp,
        },
        {
          title: "Verification",
          value: "Manual",
          description: "Pricing data is checked against official vendor pages.",
          icon: ShieldCheck,
        },
      ]}
      features={[
        {
          title: "Vendor pricing table",
          description: "Scan provider plans, seat pricing, and API cost assumptions in one place.",
          icon: Table2,
        },
        {
          title: "Subscription comparisons",
          description: "Compare plan tiers and identify mismatches by role and usage profile.",
          icon: BadgeDollarSign,
        },
        {
          title: "Pricing history",
          description: "Track when vendors change plan limits, seats, model access, or API pricing.",
          icon: CalendarClock,
        },
        {
          title: "Refresh actions",
          description: "Re-run your audit after vendor pricing changes to update savings math.",
          icon: RefreshCcw,
        },
      ]}
      tableTitle="Vendor pricing snapshot"
      tableDescription="Representative pricing examples. Run an audit for exact plan-fit recommendations."
      tableHeaders={["Vendor", "Plan type", "Typical price", "Best use"]}
      tableRows={[
        ["Cursor", "Seat subscription", "$20-$40/seat", "Engineering teams"],
        ["GitHub Copilot", "Seat subscription", "$10-$39/seat", "Code assistance"],
        ["ChatGPT", "Seat subscription", "$20-$30/seat", "General productivity"],
        ["Claude", "Seat subscription", "$20-$30/seat", "Research and writing"],
      ]}
      emptyTitle="No pricing watchlist yet"
      emptyDescription="Start an audit to build a pricing watchlist from the vendors and plans your team actually uses."
    />
  );
}
