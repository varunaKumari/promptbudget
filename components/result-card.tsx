"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, TrendingDown, Check, AlertTriangle, ArrowRight } from "lucide-react";
import type { ToolAuditResult } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface ResultCardProps {
  result: ToolAuditResult;
  index?: number;
}

export function ResultCard({ result, index = 0 }: ResultCardProps) {
  const [expanded, setExpanded] = useState(false);

  const {
    toolName,
    toolIcon,
    currentPlan,
    currentMonthlySpend,
    seats,
    status,
    topRecommendation,
    recommendations,
  } = result;

  const statusConfig = {
    overspending: {
      label: "Overspending",
      className: "bg-danger/10 text-danger border-danger/20",
      icon: AlertTriangle,
      borderClass: "border-danger/20",
    },
    "could-optimize": {
      label: "Could optimize",
      className: "bg-warning/10 text-warning border-warning/20",
      icon: TrendingDown,
      borderClass: "border-warning/20",
    },
    optimal: {
      label: "Optimal",
      className: "bg-success/10 text-success border-success/20",
      icon: Check,
      borderClass: "border-success/20",
    },
  };

  const s = statusConfig[status];
  const StatusIcon = s.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={`rounded-xl border bg-card p-5 transition-shadow hover:shadow-md ${s.borderClass}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-lg">
            {toolIcon}
          </div>
          <div>
            <h3 className="text-sm font-semibold">{toolName}</h3>
            <p className="text-xs text-muted-foreground">
              {currentPlan} · {seats} seat{seats > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={s.className}>
          <StatusIcon className="mr-1 h-3 w-3" />
          {s.label}
        </Badge>
      </div>

      {/* Current Spend */}
      <div className="mb-4 flex items-baseline justify-between rounded-lg bg-muted/50 px-4 py-3">
        <span className="text-xs text-muted-foreground">Current spend</span>
        <span className="text-lg font-bold font-tabular">
          ${currentMonthlySpend.toLocaleString()}
          <span className="text-xs font-normal text-muted-foreground">/mo</span>
        </span>
      </div>

      {/* Top Recommendation */}
      {topRecommendation && topRecommendation.type !== "optimal" && (
        <div className="mb-3 rounded-lg border border-success/20 bg-success/[0.04] p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="flex items-center gap-1 text-xs font-semibold text-success">
              <TrendingDown className="h-3 w-3" />
              Recommended
            </span>
            <span className="text-sm font-bold font-tabular text-success">
              −${topRecommendation.monthlySavings.toLocaleString()}/mo
            </span>
          </div>
          <p className="mb-1 text-sm font-medium">{topRecommendation.action}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {topRecommendation.reason}
          </p>

          {/* Confidence label */}
          <div className="mt-2">
            <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
              topRecommendation.confidence === "high"
                ? "bg-success/10 text-success"
                : topRecommendation.confidence === "medium"
                  ? "bg-warning/10 text-warning"
                  : "bg-muted text-muted-foreground"
            }`}>
              {topRecommendation.confidence} confidence
            </span>
          </div>
        </div>
      )}

      {/* Optimal Status */}
      {topRecommendation?.type === "optimal" && (
        <div className="rounded-lg border border-success/20 bg-success/[0.04] p-4">
          <p className="flex items-center gap-1.5 text-sm text-success">
            <Check className="h-3.5 w-3.5" />
            {topRecommendation.reason}
          </p>
        </div>
      )}

      {/* Other Recommendations (expandable) */}
      {recommendations.length > 1 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <span>{recommendations.length - 1} other option{recommendations.length - 1 > 1 ? "s" : ""}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 space-y-2">
                  {recommendations.slice(1).map((rec, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border bg-muted/30 p-3"
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-medium">{rec.action}</span>
                        <span className="text-xs font-medium font-tabular text-success">
                          −${rec.monthlySavings.toLocaleString()}/mo
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {rec.reason.split(".")[0]}.
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
