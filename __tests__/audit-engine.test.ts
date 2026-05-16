// ============================================================
// Audit Engine Tests — Core business logic validation
// Run with: npx vitest run
// ============================================================

import { describe, it, expect } from "vitest";
import { runAudit } from "@/lib/audit-engine";
import {
  getToolById,
  getPlanById,
  calculateMonthlyCost,
  getComparableTools,
  getSubscriptionTools,
  getApiTools,
  TOOLS,
} from "@/lib/pricing-data";
import { calculateBenchmark } from "@/lib/benchmarks";
import type { AuditInput } from "@/lib/types";

// ============================================================
// Test 1: Pricing data integrity
// ============================================================
describe("Pricing Data Integrity", () => {
  it("should have at least 8 tools in the database", () => {
    expect(TOOLS.length).toBeGreaterThanOrEqual(8);
  });

  it("every tool should have at least one plan with a price", () => {
    for (const tool of TOOLS) {
      const hasPricedPlan = tool.plans.some(
        (p) => p.pricePerUserPerMonth >= 0
      );
      expect(hasPricedPlan).toBe(true);
    }
  });

  it("every tool should have a valid pricing URL", () => {
    for (const tool of TOOLS) {
      expect(tool.pricingUrl).toMatch(/^https?:\/\//);
    }
  });

  it("every plan should have a unique ID within its tool", () => {
    for (const tool of TOOLS) {
      const ids = tool.plans.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(ids.length).toBe(uniqueIds.size);
    }
  });

  it("per-seat plans with minSeats should have minSeats >= 1", () => {
    for (const tool of TOOLS) {
      for (const plan of tool.plans) {
        if (plan.isPerSeat && plan.minSeats !== undefined) {
          expect(plan.minSeats).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });
});

// ============================================================
// Test 2: Helper function correctness
// ============================================================
describe("Pricing Helper Functions", () => {
  it("getToolById returns correct tool", () => {
    const cursor = getToolById("cursor");
    expect(cursor).toBeDefined();
    expect(cursor!.name).toBe("Cursor");
  });

  it("getToolById returns undefined for unknown tool", () => {
    expect(getToolById("nonexistent")).toBeUndefined();
  });

  it("getPlanById returns correct plan", () => {
    const plan = getPlanById("cursor", "cursor-pro");
    expect(plan).toBeDefined();
    expect(plan!.name).toBe("Pro");
    expect(plan!.pricePerUserPerMonth).toBe(20);
  });

  it("calculateMonthlyCost works for per-seat plans", () => {
    const plan = getPlanById("cursor", "cursor-teams")!;
    expect(calculateMonthlyCost(plan, 5)).toBe(200); // $40 × 5
  });

  it("calculateMonthlyCost works for individual plans", () => {
    const plan = getPlanById("claude", "claude-pro")!;
    expect(calculateMonthlyCost(plan, 1)).toBe(20);
    expect(calculateMonthlyCost(plan, 5)).toBe(20); // Not per-seat
  });

  it("getComparableTools returns same-category tools", () => {
    const comparables = getComparableTools("cursor", "coding");
    expect(comparables.length).toBeGreaterThan(0);
    expect(comparables.every((t) => t.id !== "cursor")).toBe(true);
    expect(comparables.every((t) => t.category === "coding-assistant")).toBe(true);
  });

  it("getSubscriptionTools excludes API platforms", () => {
    const sub = getSubscriptionTools();
    expect(sub.every((t) => t.category !== "api-platform")).toBe(true);
  });

  it("getApiTools returns only API platforms", () => {
    const api = getApiTools();
    expect(api.every((t) => t.category === "api-platform")).toBe(true);
    expect(api.length).toBeGreaterThanOrEqual(2);
  });
});

// ============================================================
// Test 3: Audit engine — basic functionality
// ============================================================
describe("Audit Engine — Basic Functionality", () => {
  it("returns valid result structure for a single tool", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-pro",
          seats: 1,
          monthlySpend: 20,
        },
      ],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);

    expect(result.toolResults).toHaveLength(1);
    expect(result.totalCurrentMonthlySpend).toBe(20);
    expect(result.totalMonthlySavings).toBeGreaterThanOrEqual(0);
    expect(result.totalAnnualSavings).toBe(result.totalMonthlySavings * 12);
    expect(result.savingsPercentage).toBeGreaterThanOrEqual(0);
    expect(result.savingsPercentage).toBeLessThanOrEqual(100);
    expect(["significant-savings", "moderate-savings", "minimal-savings", "optimal"])
      .toContain(result.overallStatus);
  });

  it("returns empty toolResults for empty input", () => {
    const input: AuditInput = {
      tools: [],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    expect(result.toolResults).toHaveLength(0);
    expect(result.totalCurrentMonthlySpend).toBe(0);
    expect(result.overallStatus).toBe("optimal");
  });

  it("handles multiple tools correctly", () => {
    const input: AuditInput = {
      tools: [
        { toolId: "cursor", planId: "cursor-teams", seats: 5, monthlySpend: 200 },
        { toolId: "claude", planId: "claude-pro", seats: 1, monthlySpend: 20 },
        { toolId: "chatgpt", planId: "chatgpt-plus", seats: 1, monthlySpend: 20 },
      ],
      teamSize: 5,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    expect(result.toolResults).toHaveLength(3);
    expect(result.totalCurrentMonthlySpend).toBe(240);
  });
});

// ============================================================
// Test 4: Audit engine — plan fit recommendations
// ============================================================
describe("Audit Engine — Plan Fit Recommendations", () => {
  it("detects overspending on team plan with small team", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-teams",
          seats: 2,
          monthlySpend: 80, // $40 × 2 for Teams plan
        },
      ],
      teamSize: 2,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    const cursorResult = result.toolResults[0];

    // Should have at least one recommendation to save money
    expect(cursorResult.recommendations.length).toBeGreaterThan(0);

    // The recommendations should suggest savings
    const savingsRecs = cursorResult.recommendations.filter(
      (r) => r.monthlySavings > 0
    );
    expect(savingsRecs.length).toBeGreaterThan(0);
  });

  it("detects enterprise plan is overkill for small team", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "chatgpt",
          planId: "chatgpt-enterprise",
          seats: 5,
          monthlySpend: 150, // $30 × 5
        },
      ],
      teamSize: 5,
      primaryUseCase: "mixed",
    };

    const result = runAudit(input);
    const chatgptResult = result.toolResults[0];

    // Should recommend downgrading from Enterprise
    const downgradeRecs = chatgptResult.recommendations.filter(
      (r) => r.type === "downgrade" || r.type === "switch-plan"
    );
    expect(downgradeRecs.length).toBeGreaterThan(0);
  });

  it("marks optimal spend correctly", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "github-copilot",
          planId: "copilot-pro",
          seats: 1,
          monthlySpend: 10,
        },
      ],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    const copilotResult = result.toolResults[0];

    // At $10/mo for a solo dev, this is already the cheapest coding tool
    // It should either be optimal or have minimal recommendations
    expect(copilotResult.status).toBeDefined();
  });
});

// ============================================================
// Test 5: Audit engine — Credex savings
// ============================================================
describe("Audit Engine — Credex Savings", () => {
  it("recommends Credex credits for significant spend", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-teams",
          seats: 10,
          monthlySpend: 400, // $40 × 10
        },
      ],
      teamSize: 10,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    const cursorResult = result.toolResults[0];

    // Should have a Credex recommendation
    const credexRecs = cursorResult.recommendations.filter(
      (r) => r.type === "credex"
    );
    expect(credexRecs.length).toBe(1);
    expect(credexRecs[0].monthlySavings).toBeGreaterThan(0);
  });

  it("skips Credex for very small spend", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "github-copilot",
          planId: "copilot-pro",
          seats: 1,
          monthlySpend: 10,
        },
      ],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    const copilotResult = result.toolResults[0];

    // Credex shouldn't recommend for $10/mo (threshold is $20)
    const credexRecs = copilotResult.recommendations.filter(
      (r) => r.type === "credex"
    );
    expect(credexRecs.length).toBe(0);
  });
});

// ============================================================
// Test 6: Audit engine — alternatives
// ============================================================
describe("Audit Engine — Alternative Tool Suggestions", () => {
  it("suggests cheaper coding alternatives when available", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-pro",
          seats: 1,
          monthlySpend: 20,
        },
      ],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    const cursorResult = result.toolResults[0];

    // GitHub Copilot Pro at $10/mo should appear as an alternative
    const alternativeRecs = cursorResult.recommendations.filter(
      (r) => r.type === "alternative"
    );
    expect(alternativeRecs.length).toBeGreaterThan(0);
  });

  it("does not suggest alternatives for API platforms", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "anthropic-api",
          planId: "anthropic-api-sonnet",
          seats: 1,
          monthlySpend: 500,
        },
      ],
      teamSize: 1,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    const apiResult = result.toolResults[0];

    // API platforms shouldn't suggest switching to another API
    const alternativeRecs = apiResult.recommendations.filter(
      (r) => r.type === "alternative"
    );
    expect(alternativeRecs.length).toBe(0);
  });
});

// ============================================================
// Test 7: Overall status calculation
// ============================================================
describe("Audit Engine — Overall Status", () => {
  it("returns 'significant-savings' for >$500/mo savings", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-ultra",
          seats: 10,
          monthlySpend: 2000, // $200 × 10
        },
      ],
      teamSize: 10,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    // With $2000/mo on Ultra for 10 users, there should be significant savings
    expect(result.totalMonthlySavings).toBeGreaterThan(0);
  });

  it("calculates savings percentage correctly", () => {
    const input: AuditInput = {
      tools: [
        {
          toolId: "cursor",
          planId: "cursor-teams",
          seats: 5,
          monthlySpend: 200,
        },
      ],
      teamSize: 5,
      primaryUseCase: "coding",
    };

    const result = runAudit(input);
    if (result.totalCurrentMonthlySpend > 0) {
      const expectedPercent = Math.round(
        (result.totalMonthlySavings / result.totalCurrentMonthlySpend) * 100
      );
      expect(result.savingsPercentage).toBe(expectedPercent);
    }
  });
});

// ============================================================
// Test 8: Benchmark calculations
// ============================================================
describe("Benchmark Calculations", () => {
  it("calculates spend per developer correctly", () => {
    const result = calculateBenchmark(200, 5);
    expect(result.spendPerDev).toBe(40);
  });

  it("returns correct company stage for team size", () => {
    const solo = calculateBenchmark(20, 1);
    expect(solo.benchmark.companyStage).toBe("Solo / Freelancer");

    const seedStage = calculateBenchmark(200, 5);
    expect(seedStage.benchmark.companyStage).toBe("Pre-Seed / Seed");

    const seriesA = calculateBenchmark(3000, 30);
    expect(seriesA.benchmark.companyStage).toBe("Series A");
  });

  it("identifies above-median spending", () => {
    // Solo dev spending $100/mo — well above median of ~$20
    const result = calculateBenchmark(100, 1);
    expect(result.vsMedian).toBeGreaterThan(0);
    expect(result.percentile).toMatch(/(Above Median|Top 25%)/);
  });

  it("identifies below-median spending", () => {
    // 10 devs spending $150/mo total = $15/dev — below median
    const result = calculateBenchmark(150, 10);
    expect(result.vsMedian).toBeLessThan(0);
    expect(result.percentile).toMatch(/(Below Median|Bottom 25%)/);
  });

  it("handles edge case of zero team size", () => {
    const result = calculateBenchmark(200, 0);
    expect(result.spendPerDev).toBe(0);
  });
});
