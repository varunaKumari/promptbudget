import type { Metadata } from "next";
import {
  ArrowDownToLine,
  BadgeDollarSign,
  Brain,
  FileText,
  Mail,
  Presentation,
  Share2,
  WalletCards,
} from "lucide-react";
import { FeaturePageShell } from "@/components/dashboard/feature-page-shell";

export const metadata: Metadata = {
  title: "Reports",
  description: "Create CFO-ready AI spend reports, exports, and summaries.",
};

export default function ReportsPage() {
  return (
    <FeaturePageShell
      eyebrow="Reports"
      title="Turn AI spend data into finance-ready decisions."
      description="Package recommendations, savings summaries, and vendor actions into reports that founders, finance, and engineering can review quickly."
      ctaLabel="Create report"
      ctaHref="/audit/start"
      metrics={[
        {
          title: "Potential savings",
          value: "$3.2k/mo",
          description: "Modeled savings surfaced across duplicate seats and plan-fit changes.",
          icon: BadgeDollarSign,
          trend: "Draft report",
        },
        {
          title: "CFO summary",
          value: "6 cards",
          description: "Executive-ready cards for savings, risks, and next actions.",
          icon: WalletCards,
        },
        {
          title: "Exports",
          value: "PDF/CSV",
          description: "Downloadable outputs for budget reviews and procurement notes.",
          icon: ArrowDownToLine,
        },
        {
          title: "Share status",
          value: "Private",
          description: "Reports remain private until you generate a shareable result link.",
          icon: Share2,
        },
      ]}
      features={[
        {
          title: "Downloadable reports",
          description: "Generate PDF and CSV-ready summaries for recurring finance workflows.",
          icon: FileText,
        },
        {
          title: "CFO summary cards",
          description: "Condense audit findings into concise, board-friendly decision blocks.",
          icon: Presentation,
        },
        {
          title: "Savings overview",
          description: "Rank savings by confidence, urgency, and expected monthly impact.",
          icon: Brain,
        },
        {
          title: "Export options",
          description: "Send summaries to stakeholders or export raw tool data for analysis.",
          icon: Mail,
        },
      ]}
      tableTitle="Report queue"
      tableDescription="Example report outputs that become available after a completed audit."
      tableHeaders={["Report", "Audience", "Format", "Status"]}
      tableRows={[
        ["Executive savings summary", "Founder / CFO", "PDF", "Ready after audit"],
        ["Vendor action list", "Ops / Procurement", "CSV", "Ready after audit"],
        ["Tool overlap review", "Engineering", "PDF", "Ready after audit"],
        ["Budget forecast", "Finance", "CSV", "Coming soon"],
      ]}
      emptyTitle="No reports generated yet"
      emptyDescription="Complete an audit to unlock downloadable reports, CFO cards, savings overviews, and export options."
    />
  );
}
