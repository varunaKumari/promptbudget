import type { ToolAuditResult } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface ResultCardProps {
  result: ToolAuditResult;
}

export function ResultCard({ result }: ResultCardProps) {
  const { toolName, toolIcon, currentPlan, currentMonthlySpend, seats, status, topRecommendation, recommendations } = result;

  const statusConfig = {
    overspending: {
      label: "Overspending",
      className: "bg-red-500/10 text-red-500 border-red-500/20",
    },
    "could-optimize": {
      label: "Could Optimize",
      className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
    optimal: {
      label: "Optimal",
      className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
  };

  const statusStyle = statusConfig[status];

  return (
    <div className="group rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/20 hover:shadow-lg">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl" role="img" aria-label={toolName}>
            {toolIcon}
          </span>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{toolName}</h3>
            <p className="text-sm text-muted-foreground">
              {currentPlan} · {seats} seat{seats > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Badge variant="outline" className={statusStyle.className}>
          {statusStyle.label}
        </Badge>
      </div>

      {/* Current Spend */}
      <div className="mb-4 rounded-xl bg-muted/50 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted-foreground">Current spend</span>
          <span className="text-2xl font-bold text-foreground">
            ${currentMonthlySpend.toLocaleString()}
            <span className="text-sm font-normal text-muted-foreground">/mo</span>
          </span>
        </div>
      </div>

      {/* Top Recommendation */}
      {topRecommendation && topRecommendation.type !== "optimal" && (
        <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              💡 Recommended
            </span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              Save ${topRecommendation.monthlySavings.toLocaleString()}/mo
            </span>
          </div>
          <p className="mb-2 text-sm font-medium text-foreground">
            {topRecommendation.action}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {topRecommendation.reason}
          </p>
        </div>
      )}

      {/* Optimal Status */}
      {topRecommendation?.type === "optimal" && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            ✅ {topRecommendation.reason}
          </p>
        </div>
      )}

      {/* Other Recommendations */}
      {recommendations.length > 1 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
            {recommendations.length - 1} other option{recommendations.length - 1 > 1 ? "s" : ""}
          </summary>
          <div className="mt-3 space-y-2">
            {recommendations.slice(1).map((rec, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-foreground">
                    {rec.action}
                  </span>
                  <span className="text-sm text-emerald-600 dark:text-emerald-400">
                    -${rec.monthlySavings.toLocaleString()}/mo
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {rec.reason.split(".")[0]}.
                </p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
