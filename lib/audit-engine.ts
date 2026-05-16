// ============================================================
// Audit Engine — Core logic for AI spend analysis
// All rules are hardcoded (not AI-generated) for defensibility.
// A finance person should read the reasoning and agree.
// ============================================================

import type {
  AuditInput,
  AuditResult,
  ToolAuditResult,
  Recommendation,
  ToolEntry,
  OverallStatus,
  ToolStatus,
  UseCase,
} from "./types";
import {
  getToolById,
  getPlanById,
  getComparableTools,
  calculateMonthlyCost,
  TOOLS,
} from "./pricing-data";

// ============================================================
// Main Entry Point
// ============================================================

/**
 * Run a complete audit on the user's AI tool spend.
 *
 * For each tool, the engine evaluates:
 * 1. Is the user on the right plan for their team size/usage?
 * 2. Is there a cheaper plan from the same vendor that fits?
 * 3. Is there a cheaper alternative tool with similar capabilities?
 * 4. Could they save by purchasing through Credex credits?
 */
export function runAudit(input: AuditInput): AuditResult {
  const toolResults: ToolAuditResult[] = input.tools
    .map((entry) => auditSingleTool(entry, input))
    .filter((r): r is ToolAuditResult => r !== null);

  const totalCurrentMonthlySpend = toolResults.reduce(
    (sum, r) => sum + r.currentMonthlySpend,
    0
  );

  // Calculate optimized spend using the best recommendation per tool
  const totalOptimizedMonthlySpend = toolResults.reduce((sum, r) => {
    if (r.topRecommendation && r.topRecommendation.type !== "optimal") {
      return sum + r.topRecommendation.newMonthlySpend;
    }
    return sum + r.currentMonthlySpend;
  }, 0);

  const totalMonthlySavings = totalCurrentMonthlySpend - totalOptimizedMonthlySpend;
  const totalAnnualSavings = totalMonthlySavings * 12;
  const savingsPercentage =
    totalCurrentMonthlySpend > 0
      ? Math.round((totalMonthlySavings / totalCurrentMonthlySpend) * 100)
      : 0;

  const overallStatus = determineOverallStatus(totalMonthlySavings);

  return {
    inputData: input,
    toolResults,
    totalCurrentMonthlySpend,
    totalOptimizedMonthlySpend,
    totalMonthlySavings,
    totalAnnualSavings,
    savingsPercentage,
    overallStatus,
  };
}

// ============================================================
// Single Tool Audit
// ============================================================

function auditSingleTool(
  entry: ToolEntry,
  input: AuditInput
): ToolAuditResult | null {
  const tool = getToolById(entry.toolId);
  const currentPlan = getPlanById(entry.toolId, entry.planId);

  if (!tool || !currentPlan) return null;

  const recommendations: Recommendation[] = [];

  // 1. Check if they're on the right plan for their team size
  const planFitRecs = checkPlanFit(entry, input.teamSize, input.primaryUseCase);
  recommendations.push(...planFitRecs);

  // 2. Check for cheaper plans from the same vendor
  const cheaperPlanRecs = findCheaperSameVendorPlans(entry, input.teamSize);
  recommendations.push(...cheaperPlanRecs);

  // 3. Check for cheaper alternative tools
  const alternativeRecs = findCheaperAlternatives(
    entry,
    input.primaryUseCase,
    input.teamSize
  );
  recommendations.push(...alternativeRecs);

  // 4. Check Credex credit savings
  const credexRec = checkCredexSavings(entry);
  if (credexRec) recommendations.push(credexRec);

  // Deduplicate and sort by savings (highest first)
  const uniqueRecs = deduplicateRecommendations(recommendations);
  uniqueRecs.sort((a, b) => b.monthlySavings - a.monthlySavings);

  // Pick the top recommendation
  const topRecommendation = uniqueRecs.length > 0 ? uniqueRecs[0] : null;

  // If no savings found, mark as optimal
  if (!topRecommendation || topRecommendation.monthlySavings <= 0) {
    const optimalRec: Recommendation = {
      type: "optimal",
      action: "Keep current plan",
      newMonthlySpend: entry.monthlySpend,
      monthlySavings: 0,
      annualSavings: 0,
      reason: `Your ${tool.name} ${currentPlan.name} plan is well-suited for your team size and use case. No action needed.`,
      confidence: "high",
    };

    return {
      toolId: entry.toolId,
      toolName: tool.name,
      toolIcon: tool.icon,
      currentPlan: currentPlan.name,
      currentMonthlySpend: entry.monthlySpend,
      seats: entry.seats,
      recommendations: [optimalRec],
      topRecommendation: optimalRec,
      status: "optimal",
    };
  }

  const status: ToolStatus =
    topRecommendation.monthlySavings > entry.monthlySpend * 0.3
      ? "overspending"
      : "could-optimize";

  return {
    toolId: entry.toolId,
    toolName: tool.name,
    toolIcon: tool.icon,
    currentPlan: currentPlan.name,
    currentMonthlySpend: entry.monthlySpend,
    seats: entry.seats,
    recommendations: uniqueRecs.filter((r) => r.monthlySavings > 0),
    topRecommendation,
    status,
  };
}

// ============================================================
// Rule 1: Plan Fit Check
// Is the user on the right plan for their team size?
// ============================================================

function checkPlanFit(
  entry: ToolEntry,
  teamSize: number,
  _useCase: UseCase
): Recommendation[] {
  const tool = getToolById(entry.toolId);
  const currentPlan = getPlanById(entry.toolId, entry.planId);
  if (!tool || !currentPlan) return [];

  const recs: Recommendation[] = [];

  // Rule: Using a team/business plan with very few users
  // If the plan has minSeats and user is at or near the minimum,
  // check if individual plans would be cheaper
  if (currentPlan.isPerSeat && currentPlan.minSeats && entry.seats <= 3) {
    // Find individual plans from the same tool
    const individualPlans = tool.plans.filter(
      (p) =>
        !p.isPerSeat &&
        p.pricePerUserPerMonth > 0 &&
        p.pricePerUserPerMonth < currentPlan.pricePerUserPerMonth * entry.seats
    );

    for (const altPlan of individualPlans) {
      const newCost = altPlan.pricePerUserPerMonth * entry.seats;
      const savings = entry.monthlySpend - newCost;

      if (savings > 0) {
        recs.push({
          type: "downgrade",
          action: `Switch to ${entry.seats} individual ${altPlan.name} plans`,
          targetToolName: tool.name,
          targetPlanName: altPlan.name,
          newMonthlySpend: newCost,
          monthlySavings: savings,
          annualSavings: savings * 12,
          reason: `With only ${entry.seats} user${entry.seats > 1 ? "s" : ""}, ${entry.seats} individual ${altPlan.name} plan${entry.seats > 1 ? "s" : ""} at $${altPlan.pricePerUserPerMonth}/mo each ($${newCost}/mo total) is cheaper than the ${currentPlan.name} plan at $${currentPlan.pricePerUserPerMonth}/user/mo ($${entry.monthlySpend}/mo). Team features are unnecessary for a team this small.`,
          confidence: "high",
        });
      }
    }
  }

  // Rule: Using enterprise plan with small team
  if (
    currentPlan.name.toLowerCase().includes("enterprise") &&
    teamSize <= 10
  ) {
    const teamPlans = tool.plans.filter(
      (p) =>
        (p.name.toLowerCase().includes("team") ||
          p.name.toLowerCase().includes("business")) &&
        !p.isCustomPricing
    );

    for (const teamPlan of teamPlans) {
      const newCost = calculateMonthlyCost(teamPlan, entry.seats);
      const savings = entry.monthlySpend - newCost;

      if (savings > 0) {
        recs.push({
          type: "downgrade",
          action: `Downgrade to ${teamPlan.name} plan`,
          targetToolName: tool.name,
          targetPlanName: teamPlan.name,
          newMonthlySpend: newCost,
          monthlySavings: savings,
          annualSavings: savings * 12,
          reason: `With a team of ${teamSize}, the Enterprise plan provides compliance and support features that teams under ~50 users rarely need. The ${teamPlan.name} plan at $${teamPlan.pricePerUserPerMonth}/user/mo includes admin controls and SSO which are sufficient for your team size.`,
          confidence: "medium",
        });
      }
    }
  }

  // Rule: On an expensive tier when usage may not justify it
  // e.g., Ultra/Max/Pro($200) plans
  if (currentPlan.pricePerUserPerMonth >= 100) {
    const midTierPlans = tool.plans.filter(
      (p) =>
        p.pricePerUserPerMonth > 0 &&
        p.pricePerUserPerMonth < currentPlan.pricePerUserPerMonth &&
        p.pricePerUserPerMonth >= 15
    );

    for (const midPlan of midTierPlans) {
      const newCost = midPlan.isPerSeat
        ? midPlan.pricePerUserPerMonth * entry.seats
        : midPlan.pricePerUserPerMonth;
      const savings = entry.monthlySpend - newCost;

      if (savings > 0 && savings >= entry.monthlySpend * 0.2) {
        recs.push({
          type: "switch-plan",
          action: `Consider ${midPlan.name} plan instead`,
          targetToolName: tool.name,
          targetPlanName: midPlan.name,
          newMonthlySpend: newCost,
          monthlySavings: savings,
          annualSavings: savings * 12,
          reason: `The ${currentPlan.name} plan at $${currentPlan.pricePerUserPerMonth}/mo provides premium features and maximum limits. Unless you consistently hit rate limits on the ${midPlan.name} plan ($${midPlan.pricePerUserPerMonth}/mo), the lower tier may be sufficient. Review your usage before switching.`,
          confidence: "medium",
        });
      }
    }
  }

  return recs;
}

// ============================================================
// Rule 2: Cheaper Same-Vendor Plans
// ============================================================

function findCheaperSameVendorPlans(
  entry: ToolEntry,
  teamSize: number
): Recommendation[] {
  const tool = getToolById(entry.toolId);
  const currentPlan = getPlanById(entry.toolId, entry.planId);
  if (!tool || !currentPlan) return [];

  const recs: Recommendation[] = [];

  // Check every plan from the same tool that's cheaper
  for (const plan of tool.plans) {
    if (plan.id === entry.planId) continue;
    if (plan.pricePerUserPerMonth === 0) continue; // Skip free tiers for recommendations
    if (plan.isCustomPricing) continue;

    // Check minimum seats requirement
    if (plan.minSeats && entry.seats < plan.minSeats) continue;
    if (plan.maxRecommendedSeats && teamSize > plan.maxRecommendedSeats) continue;

    const newCost = calculateMonthlyCost(plan, entry.seats);
    const savings = entry.monthlySpend - newCost;

    if (savings > 0 && savings >= 5) {
      // Only suggest if saving at least $5/mo
      recs.push({
        type: "switch-plan",
        action: `Switch to ${plan.name} plan`,
        targetToolName: tool.name,
        targetPlanName: plan.name,
        newMonthlySpend: newCost,
        monthlySavings: savings,
        annualSavings: savings * 12,
        reason: `The ${plan.name} plan at $${plan.isPerSeat ? plan.pricePerUserPerMonth + "/user" : plan.pricePerUserPerMonth}/mo covers your core needs: ${plan.features.slice(0, 2).join(", ")}. ${plan.bestFor}.`,
        confidence: "high",
      });
    }
  }

  return recs;
}

// ============================================================
// Rule 3: Cheaper Alternative Tools
// ============================================================

function findCheaperAlternatives(
  entry: ToolEntry,
  useCase: UseCase,
  teamSize: number
): Recommendation[] {
  const currentTool = getToolById(entry.toolId);
  const currentPlan = getPlanById(entry.toolId, entry.planId);
  if (!currentTool || !currentPlan) return [];

  // Don't suggest alternatives for API platforms (too different)
  if (currentTool.category === "api-platform") return [];

  const recs: Recommendation[] = [];
  const comparableTools = getComparableTools(entry.toolId, useCase);

  for (const altTool of comparableTools) {
    // Find the most comparable plan in the alternative tool
    const comparablePlans = findComparablePlans(
      altTool,
      currentPlan,
      entry.seats,
      teamSize
    );

    for (const altPlan of comparablePlans) {
      const newCost = calculateMonthlyCost(altPlan, entry.seats);
      const savings = entry.monthlySpend - newCost;

      // Only recommend if saving at least 15% or $10/mo
      if (savings > 0 && (savings >= entry.monthlySpend * 0.15 || savings >= 10)) {
        const useCaseMatch = getUseCaseMatchReason(
          currentTool.id,
          altTool.id,
          useCase
        );

        recs.push({
          type: "alternative",
          action: `Switch to ${altTool.name} ${altPlan.name}`,
          targetToolName: altTool.name,
          targetPlanName: altPlan.name,
          newMonthlySpend: newCost,
          monthlySavings: savings,
          annualSavings: savings * 12,
          reason: `${altTool.name} ${altPlan.name} at $${altPlan.isPerSeat ? altPlan.pricePerUserPerMonth + "/user" : altPlan.pricePerUserPerMonth}/mo offers similar ${useCase} capabilities. ${useCaseMatch}`,
          confidence: "medium",
        });
      }
    }
  }

  return recs;
}

/**
 * Find plans in an alternative tool that are comparable to the current plan.
 * Matches by tier: individual→individual, team→team.
 */
function findComparablePlans(
  altTool: typeof TOOLS[number],
  currentPlan: ReturnType<typeof getPlanById>,
  seats: number,
  teamSize: number
) {
  if (!currentPlan) return [];

  const isTeamPlan =
    currentPlan.isPerSeat &&
    (currentPlan.minSeats !== undefined || teamSize > 1);

  return altTool.plans.filter((p) => {
    if (p.pricePerUserPerMonth === 0) return false;
    if (p.isCustomPricing) return false;
    if (p.minSeats && seats < p.minSeats) return false;

    // Match tier type: team plans for teams, individual for individuals
    if (isTeamPlan && seats > 1) {
      return p.isPerSeat || seats === 1;
    }
    return !p.isPerSeat || seats === 1;
  });
}

/**
 * Generate a defensible reason why the alternative is comparable
 * for the given use case.
 */
function getUseCaseMatchReason(
  currentToolId: string,
  altToolId: string,
  useCase: UseCase
): string {
  const matchReasons: Record<string, Record<string, Record<string, string>>> = {
    coding: {
      cursor: {
        "github-copilot":
          "GitHub Copilot offers comparable code completion and chat, and at $10/mo for Pro it's the most cost-effective coding assistant. It integrates with VS Code, JetBrains, and Neovim.",
        windsurf:
          "Windsurf provides similar agentic coding flows with deep context awareness. Both tools offer AI-powered editing, but Windsurf's quota system may better suit consistent daily usage.",
      },
      "github-copilot": {
        cursor:
          "Cursor provides a full AI-native editor experience with agentic coding. The unlimited Auto mode on paid plans makes it cost-effective for heavy users.",
        windsurf:
          "Windsurf offers similar IDE-integrated AI assistance with agentic flows, comparable to Copilot's agent mode.",
      },
      windsurf: {
        cursor:
          "Cursor offers a mature AI coding experience with broad model selection and unlimited Auto mode on paid plans.",
        "github-copilot":
          "GitHub Copilot Pro at $10/mo is the most affordable coding assistant with strong code completion and chat features.",
      },
    },
  };

  // Generic fallback
  const specific =
    matchReasons[useCase]?.[currentToolId]?.[altToolId];
  if (specific) return specific;

  if (useCase === "coding") {
    return "Both tools provide AI-powered coding assistance suitable for professional development workflows.";
  }
  if (useCase === "writing" || useCase === "research") {
    return "Both platforms offer strong language understanding suitable for writing and research tasks.";
  }
  return "Both tools offer comparable AI capabilities for your primary use case.";
}

// ============================================================
// Rule 4: Credex Credit Savings
// ============================================================

function checkCredexSavings(entry: ToolEntry): Recommendation | null {
  const tool = getToolById(entry.toolId);
  if (!tool || !tool.credexDiscountPercent) return null;
  if (entry.monthlySpend < 20) return null; // Not worth it for tiny spend

  const discount = tool.credexDiscountPercent;
  const savings = Math.round(entry.monthlySpend * (discount / 100) * 100) / 100;
  const newSpend = Math.round((entry.monthlySpend - savings) * 100) / 100;

  return {
    type: "credex",
    action: `Purchase through Credex credits (${discount}% off)`,
    targetToolName: "Credex",
    newMonthlySpend: newSpend,
    monthlySavings: savings,
    annualSavings: Math.round(savings * 12 * 100) / 100,
    reason: `Credex sources discounted ${tool.name} credits from companies that overforecast or pivoted. You could save ${discount}% on your current $${entry.monthlySpend}/mo spend by purchasing through Credex instead of paying retail.`,
    confidence: "high",
  };
}

// ============================================================
// Helpers
// ============================================================

function determineOverallStatus(monthlySavings: number): OverallStatus {
  if (monthlySavings >= 500) return "significant-savings";
  if (monthlySavings >= 100) return "moderate-savings";
  if (monthlySavings > 0) return "minimal-savings";
  return "optimal";
}

/**
 * Remove duplicate recommendations (same tool + same plan).
 * Keep the one with higher savings.
 */
function deduplicateRecommendations(
  recs: Recommendation[]
): Recommendation[] {
  const seen = new Map<string, Recommendation>();

  for (const rec of recs) {
    const key = `${rec.type}-${rec.targetToolName}-${rec.targetPlanName}`;
    const existing = seen.get(key);
    if (!existing || rec.monthlySavings > existing.monthlySavings) {
      seen.set(key, rec);
    }
  }

  return Array.from(seen.values());
}

// ============================================================
// Templated Summary Fallback
// (Used when Anthropic API is unavailable)
// ============================================================

export function generateTemplatedSummary(result: AuditResult): string {
  const { totalMonthlySavings, totalAnnualSavings, savingsPercentage, toolResults, overallStatus } = result;
  const toolCount = toolResults.length;
  const overspendingTools = toolResults.filter((t) => t.status === "overspending");
  const optimizableTools = toolResults.filter((t) => t.status === "could-optimize");

  if (overallStatus === "optimal") {
    return `Great news — your AI stack of ${toolCount} tool${toolCount > 1 ? "s" : ""} is well-optimized. You're on the right plans for your team size and usage patterns. We'll notify you if pricing changes or new alternatives emerge that could save you money.`;
  }

  let summary = `Based on our analysis of your ${toolCount} AI tool${toolCount > 1 ? "s" : ""}, `;

  if (overallStatus === "significant-savings") {
    summary += `we found significant optimization opportunities. `;
  } else if (overallStatus === "moderate-savings") {
    summary += `we found some solid optimization opportunities. `;
  } else {
    summary += `we found a few minor tweaks that could help. `;
  }

  summary += `You could save approximately $${totalMonthlySavings.toLocaleString()}/month ($${totalAnnualSavings.toLocaleString()}/year), a ${savingsPercentage}% reduction in your AI spend. `;

  if (overspendingTools.length > 0) {
    const topOverspend = overspendingTools[0];
    summary += `The biggest opportunity is ${topOverspend.toolName}, where ${topOverspend.topRecommendation?.reason?.split(".")[0] ?? "a plan change could reduce costs"}. `;
  }

  if (optimizableTools.length > 0 && overspendingTools.length === 0) {
    const topOptimize = optimizableTools[0];
    summary += `The main opportunity is ${topOptimize.toolName}: ${topOptimize.topRecommendation?.action ?? "consider adjusting your plan"}. `;
  }

  if (totalMonthlySavings >= 500) {
    summary += `With over $500/month in potential savings, Credex can help you capture these savings through discounted AI credits sourced from companies that overforecast.`;
  }

  return summary;
}
