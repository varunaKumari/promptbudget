// ============================================================
// Core Types for PromptBudget — AI Spend Audit Tool
// ============================================================

/** Primary use cases for AI tools */
export type UseCase = "coding" | "writing" | "data" | "research" | "mixed";

/** Tool categories for grouping and comparison */
export type ToolCategory = "coding-assistant" | "ai-chat" | "api-platform";

/** A single pricing plan for a tool */
export interface Plan {
  id: string;
  name: string;
  pricePerUserPerMonth: number;
  isPerSeat: boolean;
  minSeats?: number;
  maxRecommendedSeats?: number;
  annualDiscountPercent?: number;
  features: string[];
  limitations?: string[];
  bestFor: string;
  isCustomPricing?: boolean;
}

/** A tool in the pricing database */
export interface Tool {
  id: string;
  name: string;
  vendor: string;
  category: ToolCategory;
  icon: string;
  description: string;
  pricingUrl: string;
  lastVerified: string;
  plans: Plan[];
  useCases: UseCase[];
  credexDiscountPercent?: number;
}

// ============================================================
// User Input Types
// ============================================================

/** A single tool entry from the user's form */
export interface ToolEntry {
  toolId: string;
  planId: string;
  seats: number;
  monthlySpend: number;
}

/** Complete audit input from the user */
export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  primaryUseCase: UseCase;
}

// ============================================================
// Audit Output Types
// ============================================================

/** Type of recommendation the engine produces */
export type RecommendationType =
  | "downgrade"
  | "switch-plan"
  | "alternative"
  | "credex"
  | "optimal";

/** A single recommendation for a tool */
export interface Recommendation {
  type: RecommendationType;
  action: string;
  targetToolName?: string;
  targetPlanName?: string;
  newMonthlySpend: number;
  monthlySavings: number;
  annualSavings: number;
  reason: string;
  confidence: "high" | "medium" | "low";
}

/** Audit status for a single tool */
export type ToolStatus = "overspending" | "could-optimize" | "optimal";

/** Audit result for a single tool */
export interface ToolAuditResult {
  toolId: string;
  toolName: string;
  toolIcon: string;
  currentPlan: string;
  currentMonthlySpend: number;
  seats: number;
  recommendations: Recommendation[];
  topRecommendation: Recommendation | null;
  status: ToolStatus;
}

/** Overall audit status */
export type OverallStatus =
  | "significant-savings"
  | "moderate-savings"
  | "minimal-savings"
  | "optimal";

/** Complete audit result */
export interface AuditResult {
  id?: string;
  inputData: AuditInput;
  toolResults: ToolAuditResult[];
  totalCurrentMonthlySpend: number;
  totalOptimizedMonthlySpend: number;
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  savingsPercentage: number;
  overallStatus: OverallStatus;
  aiSummary?: string;
  createdAt?: string;
}

// ============================================================
// Lead Types
// ============================================================

/** Lead captured after value is shown */
export interface Lead {
  id?: string;
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId?: string;
  createdAt?: string;
}

// ============================================================
// API Types
// ============================================================

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/** Audit API request body */
export interface CreateAuditRequest {
  input: AuditInput;
}

/** Audit API response */
export interface CreateAuditResponse {
  id: string;
  results: AuditResult;
}

/** Lead API request body */
export interface CreateLeadRequest {
  email: string;
  companyName?: string;
  role?: string;
  teamSize?: number;
  auditId: string;
  honeypot?: string;
}

/** Summary API request body */
export interface CreateSummaryRequest {
  auditId: string;
  results: AuditResult;
}
