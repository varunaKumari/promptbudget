// ============================================================
// Pricing Database — All AI tools with current pricing
// Every number traces to a vendor URL in PRICING_DATA.md
// Last verified: 2026-05-16
// ============================================================

import type { Tool, Plan, UseCase } from "./types";

export const TOOLS: Tool[] = [
  // ──────────────────────────────────────────────────
  // CODING ASSISTANTS
  // ──────────────────────────────────────────────────
  {
    id: "cursor",
    name: "Cursor",
    vendor: "Anysphere",
    category: "coding-assistant",
    icon: "⚡",
    description: "AI-powered code editor with agentic coding capabilities",
    pricingUrl: "https://cursor.com/pricing",
    lastVerified: "2026-05-16",
    useCases: ["coding"],
    credexDiscountPercent: 15,
    plans: [
      {
        id: "cursor-hobby",
        name: "Hobby",
        pricePerUserPerMonth: 0,
        isPerSeat: false,
        features: [
          "Limited AI requests",
          "Basic code completion",
          "Community support",
        ],
        limitations: ["Very limited premium model access", "No team features"],
        bestFor: "Hobbyists evaluating Cursor",
      },
      {
        id: "cursor-pro",
        name: "Pro",
        pricePerUserPerMonth: 20,
        isPerSeat: true,
        annualDiscountPercent: 20,
        features: [
          "$20 monthly credit pool",
          "Unlimited Auto mode",
          "All premium models",
          "Priority support",
        ],
        bestFor: "Individual professional developers",
      },
      {
        id: "cursor-pro-plus",
        name: "Pro+",
        pricePerUserPerMonth: 60,
        isPerSeat: true,
        annualDiscountPercent: 20,
        features: [
          "$60 monthly credit pool",
          "Unlimited Auto mode",
          "Higher rate limits",
          "All premium models",
        ],
        bestFor: "Power users needing higher credit limits",
      },
      {
        id: "cursor-ultra",
        name: "Ultra",
        pricePerUserPerMonth: 200,
        isPerSeat: true,
        annualDiscountPercent: 20,
        features: [
          "$200 monthly credit pool",
          "Unlimited Auto mode",
          "Maximum rate limits",
          "All premium models",
        ],
        bestFor: "Heavy AI-native developers",
      },
      {
        id: "cursor-teams",
        name: "Teams",
        pricePerUserPerMonth: 40,
        isPerSeat: true,
        minSeats: 2,
        annualDiscountPercent: 20,
        features: [
          "Pro features per member",
          "Centralized billing",
          "Team-wide rules",
          "Usage analytics",
          "SSO & security controls",
        ],
        bestFor: "Engineering teams needing collaboration and admin tools",
      },
      {
        id: "cursor-enterprise",
        name: "Enterprise",
        pricePerUserPerMonth: 40,
        isPerSeat: true,
        isCustomPricing: true,
        features: [
          "Everything in Teams",
          "Custom contracts",
          "Dedicated support",
          "Advanced compliance",
          "SAML SSO",
        ],
        bestFor: "Large organizations with compliance requirements",
      },
    ],
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    vendor: "GitHub / Microsoft",
    category: "coding-assistant",
    icon: "🤖",
    description: "AI pair programmer integrated into your IDE",
    pricingUrl: "https://github.com/features/copilot#pricing",
    lastVerified: "2026-05-16",
    useCases: ["coding"],
    credexDiscountPercent: 12,
    plans: [
      {
        id: "copilot-pro",
        name: "Pro",
        pricePerUserPerMonth: 10,
        isPerSeat: false,
        features: [
          "$10 monthly AI credits",
          "Code completion",
          "Chat in IDE",
          "Multi-model support",
        ],
        bestFor: "Individual developers on a budget",
      },
      {
        id: "copilot-pro-plus",
        name: "Pro+",
        pricePerUserPerMonth: 39,
        isPerSeat: false,
        features: [
          "$39 monthly AI credits",
          "All Pro features",
          "Agent mode",
          "Higher limits",
          "Premium models",
        ],
        bestFor: "Power users wanting full AI agent capabilities",
      },
      {
        id: "copilot-business",
        name: "Business",
        pricePerUserPerMonth: 19,
        isPerSeat: true,
        minSeats: 1,
        features: [
          "$19 monthly AI credits per seat",
          "Organization management",
          "Policy controls",
          "Audit logs",
          "IP indemnity",
        ],
        bestFor: "Teams needing admin controls and compliance",
      },
      {
        id: "copilot-enterprise",
        name: "Enterprise",
        pricePerUserPerMonth: 39,
        isPerSeat: true,
        minSeats: 1,
        features: [
          "$39 monthly AI credits per seat",
          "Everything in Business",
          "Codebase-aware chat",
          "Fine-tuned models",
          "SAML SSO",
        ],
        limitations: ["Requires GitHub Enterprise Cloud ($21/user/mo extra)"],
        bestFor:
          "Large enterprises needing codebase customization and compliance",
      },
    ],
  },
  {
    id: "windsurf",
    name: "Windsurf",
    vendor: "Codeium",
    category: "coding-assistant",
    icon: "🏄",
    description: "AI-powered IDE with agentic flows and deep context awareness",
    pricingUrl: "https://windsurf.com/pricing",
    lastVerified: "2026-05-16",
    useCases: ["coding"],
    credexDiscountPercent: 10,
    plans: [
      {
        id: "windsurf-free",
        name: "Free",
        pricePerUserPerMonth: 0,
        isPerSeat: false,
        features: [
          "Basic AI assistance",
          "Limited usage",
          "Community support",
        ],
        limitations: ["Limited models", "Low quotas"],
        bestFor: "Hobbyists trying out AI coding",
      },
      {
        id: "windsurf-pro",
        name: "Pro",
        pricePerUserPerMonth: 20,
        isPerSeat: true,
        features: [
          "Higher daily/weekly quotas",
          "Advanced models",
          "Agentic flows",
          "Priority support",
        ],
        bestFor: "Individual professional developers",
      },
      {
        id: "windsurf-teams",
        name: "Teams",
        pricePerUserPerMonth: 40,
        isPerSeat: true,
        minSeats: 2,
        features: [
          "Admin tools",
          "Usage analytics",
          "Team management",
          "All Pro features",
        ],
        bestFor: "Engineering teams needing collaboration",
      },
      {
        id: "windsurf-max",
        name: "Max",
        pricePerUserPerMonth: 200,
        isPerSeat: true,
        features: [
          "Highest quotas",
          "Priority performance",
          "All Pro features",
        ],
        bestFor: "Power users needing maximum AI usage",
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // AI CHAT / PRODUCTIVITY
  // ──────────────────────────────────────────────────
  {
    id: "claude",
    name: "Claude",
    vendor: "Anthropic",
    category: "ai-chat",
    icon: "🧠",
    description:
      "Advanced AI assistant for coding, writing, analysis, and research",
    pricingUrl: "https://claude.ai/pricing",
    lastVerified: "2026-05-16",
    useCases: ["coding", "writing", "data", "research", "mixed"],
    credexDiscountPercent: 15,
    plans: [
      {
        id: "claude-free",
        name: "Free",
        pricePerUserPerMonth: 0,
        isPerSeat: false,
        features: [
          "Limited daily usage",
          "Sonnet & Haiku models",
          "Basic features",
        ],
        limitations: [
          "Very limited usage",
          "No Claude Code",
          "No priority access",
        ],
        bestFor: "Casual users exploring Claude",
      },
      {
        id: "claude-pro",
        name: "Pro",
        pricePerUserPerMonth: 20,
        isPerSeat: false,
        annualDiscountPercent: 15,
        features: [
          "5x more usage than Free",
          "All models (Opus, Sonnet, Haiku)",
          "Claude Code",
          "Projects",
          "Priority access",
        ],
        bestFor: "Professionals needing reliable AI assistance",
      },
      {
        id: "claude-max-5x",
        name: "Max (5x)",
        pricePerUserPerMonth: 100,
        isPerSeat: false,
        features: [
          "25x usage of Free tier",
          "All Pro features",
          "Priority access to new features",
        ],
        bestFor: "Heavy users needing high-volume access",
      },
      {
        id: "claude-max-20x",
        name: "Max (20x)",
        pricePerUserPerMonth: 200,
        isPerSeat: false,
        features: [
          "100x usage of Free tier",
          "Highest limits",
          "Priority during high traffic",
        ],
        bestFor: "Extremely heavy users or AI-first workflows",
      },
      {
        id: "claude-team-standard",
        name: "Team Standard",
        pricePerUserPerMonth: 25,
        isPerSeat: true,
        minSeats: 5,
        annualDiscountPercent: 20,
        features: [
          "1.25x Pro usage per seat",
          "Central billing",
          "SSO",
          "Enterprise security",
          "No model training on data",
        ],
        bestFor: "Teams needing shared AI with admin controls",
      },
      {
        id: "claude-team-premium",
        name: "Team Premium",
        pricePerUserPerMonth: 125,
        isPerSeat: true,
        minSeats: 5,
        annualDiscountPercent: 20,
        features: [
          "6.25x Pro usage per seat",
          "Separate weekly usage limits",
          "All Team Standard features",
        ],
        bestFor: "Teams with heavy AI usage demands",
      },
      {
        id: "claude-enterprise",
        name: "Enterprise",
        pricePerUserPerMonth: 30,
        isPerSeat: true,
        isCustomPricing: true,
        features: [
          "Unlimited usage",
          "SCIM provisioning",
          "Audit logs",
          "Custom data retention",
          "Dedicated support",
        ],
        bestFor: "Large organizations needing full compliance and unlimited use",
      },
    ],
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    vendor: "OpenAI",
    category: "ai-chat",
    icon: "💬",
    description: "Versatile AI assistant for conversation, coding, and content",
    pricingUrl: "https://openai.com/chatgpt/pricing/",
    lastVerified: "2026-05-16",
    useCases: ["coding", "writing", "data", "research", "mixed"],
    credexDiscountPercent: 12,
    plans: [
      {
        id: "chatgpt-free",
        name: "Free",
        pricePerUserPerMonth: 0,
        isPerSeat: false,
        features: ["GPT-5.3 Instant", "10 messages per 5 hours", "Basic"],
        limitations: ["Very limited", "Includes ads (US)", "No advanced models"],
        bestFor: "Casual users trying ChatGPT",
      },
      {
        id: "chatgpt-plus",
        name: "Plus",
        pricePerUserPerMonth: 20,
        isPerSeat: false,
        features: [
          "GPT-5.5 access",
          "Deep Research (10/mo)",
          "Sora",
          "Agent Mode",
          "Higher message limits",
        ],
        bestFor: "Professionals needing access to latest models",
      },
      {
        id: "chatgpt-pro-100",
        name: "Pro ($100)",
        pricePerUserPerMonth: 100,
        isPerSeat: false,
        features: [
          "GPT-5.5 & o1 Pro mode",
          "5x Plus usage limits",
          "Deep Research (50/mo)",
          "Sora",
        ],
        bestFor: "Power users needing higher limits and best models",
      },
      {
        id: "chatgpt-pro-200",
        name: "Pro ($200)",
        pricePerUserPerMonth: 200,
        isPerSeat: false,
        features: [
          "20x Plus usage limits",
          "1M-token context",
          "Deep Research (250/mo)",
          "Priority access",
        ],
        bestFor: "Heaviest users needing maximum capabilities",
      },
      {
        id: "chatgpt-business",
        name: "Business",
        pricePerUserPerMonth: 25,
        isPerSeat: true,
        minSeats: 2,
        annualDiscountPercent: 20,
        features: [
          "GPT-5.5 access",
          "SAML SSO",
          "Admin console",
          "SOC 2 compliance",
          "No training on data",
        ],
        bestFor: "Teams needing admin controls and compliance",
      },
      {
        id: "chatgpt-enterprise",
        name: "Enterprise",
        pricePerUserPerMonth: 30,
        isPerSeat: true,
        isCustomPricing: true,
        features: [
          "Unlimited GPT-5.5",
          "Advanced admin",
          "Dedicated support",
          "Custom data retention",
          "Enterprise SSO",
        ],
        bestFor: "Large organizations with high security requirements",
      },
    ],
  },
  {
    id: "gemini",
    name: "Gemini",
    vendor: "Google",
    category: "ai-chat",
    icon: "✨",
    description:
      "Google's AI assistant with deep Workspace integration and research",
    pricingUrl: "https://ai.google.dev/pricing",
    lastVerified: "2026-05-16",
    useCases: ["coding", "writing", "data", "research", "mixed"],
    credexDiscountPercent: 10,
    plans: [
      {
        id: "gemini-free",
        name: "Free",
        pricePerUserPerMonth: 0,
        isPerSeat: false,
        features: [
          "Gemini 3 Flash",
          "Basic features",
          "Limited daily quotas",
        ],
        limitations: ["Limited usage", "No advanced models"],
        bestFor: "Casual users trying Gemini",
      },
      {
        id: "gemini-ai-plus",
        name: "AI Plus",
        pricePerUserPerMonth: 7.99,
        isPerSeat: false,
        features: [
          "128k context window",
          "Increased daily quotas",
          "200GB storage",
        ],
        bestFor: "Light users wanting more capacity at low cost",
      },
      {
        id: "gemini-ai-pro",
        name: "AI Pro",
        pricePerUserPerMonth: 19.99,
        isPerSeat: false,
        features: [
          "Gemini 3.1 Pro (flagship)",
          "1M context window",
          "Deep Research",
          "2TB storage",
        ],
        bestFor: "Professionals needing best models and long context",
      },
      {
        id: "gemini-ai-ultra",
        name: "AI Ultra",
        pricePerUserPerMonth: 249.99,
        isPerSeat: false,
        features: [
          "Deep Think reasoning",
          "Project Mariner agent",
          "Veo 3.1 video",
          "30TB storage",
        ],
        bestFor:
          "Power users needing cutting-edge features and massive storage",
      },
    ],
  },
  {
    id: "v0",
    name: "v0",
    vendor: "Vercel",
    category: "coding-assistant",
    icon: "▲",
    description: "AI-powered UI generation and prototyping tool by Vercel",
    pricingUrl: "https://v0.dev/pricing",
    lastVerified: "2026-05-16",
    useCases: ["coding"],
    credexDiscountPercent: 10,
    plans: [
      {
        id: "v0-free",
        name: "Free",
        pricePerUserPerMonth: 0,
        isPerSeat: false,
        features: [
          "Limited generations per day",
          "Basic UI generation",
          "Community support",
        ],
        limitations: ["Low daily limits", "No advanced features"],
        bestFor: "Trying out AI-powered UI generation",
      },
      {
        id: "v0-premium",
        name: "Premium",
        pricePerUserPerMonth: 20,
        isPerSeat: false,
        features: [
          "Higher generation limits",
          "Advanced UI components",
          "Priority access",
          "Framework export",
        ],
        bestFor: "Professional frontend developers and designers",
      },
      {
        id: "v0-team",
        name: "Team",
        pricePerUserPerMonth: 30,
        isPerSeat: true,
        minSeats: 2,
        features: [
          "Everything in Premium",
          "Shared projects",
          "Team management",
          "Analytics",
        ],
        bestFor: "Design and frontend teams collaborating on UI",
      },
    ],
  },
  {
    id: "replit",
    name: "Replit",
    vendor: "Replit",
    category: "coding-assistant",
    icon: "🔄",
    description: "Cloud IDE with AI coding agent for full-stack development",
    pricingUrl: "https://replit.com/pricing",
    lastVerified: "2026-05-16",
    useCases: ["coding"],
    credexDiscountPercent: 10,
    plans: [
      {
        id: "replit-starter",
        name: "Starter",
        pricePerUserPerMonth: 0,
        isPerSeat: false,
        features: [
          "Basic cloud IDE",
          "Limited AI assistance",
          "Public repls",
        ],
        limitations: ["Limited compute", "No private repls"],
        bestFor: "Students and hobbyists learning to code",
      },
      {
        id: "replit-core",
        name: "Core",
        pricePerUserPerMonth: 25,
        isPerSeat: false,
        features: [
          "Replit Agent",
          "Private repls",
          "More compute power",
          "AI code generation",
        ],
        bestFor: "Individual developers wanting AI-assisted full-stack dev",
      },
      {
        id: "replit-teams",
        name: "Teams",
        pricePerUserPerMonth: 40,
        isPerSeat: true,
        minSeats: 2,
        features: [
          "Everything in Core",
          "Team management",
          "Shared environments",
          "Priority support",
        ],
        bestFor: "Teams building and deploying together",
      },
    ],
  },

  // ──────────────────────────────────────────────────
  // API PLATFORMS (Direct)
  // ──────────────────────────────────────────────────
  {
    id: "anthropic-api",
    name: "Anthropic API",
    vendor: "Anthropic",
    category: "api-platform",
    icon: "🔌",
    description:
      "Direct API access to Claude models — pay-per-token usage-based pricing",
    pricingUrl: "https://www.anthropic.com/pricing#702702",
    lastVerified: "2026-05-16",
    useCases: ["coding", "writing", "data", "research", "mixed"],
    credexDiscountPercent: 20,
    plans: [
      {
        id: "anthropic-api-haiku",
        name: "API — Haiku 4.5",
        pricePerUserPerMonth: 0,
        isPerSeat: false,
        features: [
          "Input: $1.00/MTok",
          "Output: $5.00/MTok",
          "Fast, lightweight model",
          "Batch API 50% off",
        ],
        bestFor:
          "High-volume, latency-sensitive tasks (classification, extraction)",
      },
      {
        id: "anthropic-api-sonnet",
        name: "API — Sonnet 4.6",
        pricePerUserPerMonth: 0,
        isPerSeat: false,
        features: [
          "Input: $3.00/MTok",
          "Output: $15.00/MTok",
          "Best balance of speed and quality",
          "Prompt caching 90% off",
        ],
        bestFor: "General-purpose coding and analysis at scale",
      },
      {
        id: "anthropic-api-opus",
        name: "API — Opus 4.7",
        pricePerUserPerMonth: 0,
        isPerSeat: false,
        features: [
          "Input: $5.00/MTok",
          "Output: $25.00/MTok",
          "Most capable model",
          "Batch API 50% off",
        ],
        bestFor: "Complex reasoning, creative writing, research tasks",
      },
    ],
  },
  {
    id: "openai-api",
    name: "OpenAI API",
    vendor: "OpenAI",
    category: "api-platform",
    icon: "🔧",
    description:
      "Direct API access to GPT models — pay-per-token usage-based pricing",
    pricingUrl: "https://openai.com/api/pricing/",
    lastVerified: "2026-05-16",
    useCases: ["coding", "writing", "data", "research", "mixed"],
    credexDiscountPercent: 18,
    plans: [
      {
        id: "openai-api-gpt55",
        name: "API — GPT-5.5",
        pricePerUserPerMonth: 0,
        isPerSeat: false,
        features: [
          "Input: $5.00/MTok",
          "Output: $30.00/MTok",
          "Flagship model",
          "Batch API 50% off",
        ],
        bestFor: "High-quality text generation and complex reasoning",
      },
      {
        id: "openai-api-gpt4o",
        name: "API — GPT-4o",
        pricePerUserPerMonth: 0,
        isPerSeat: false,
        features: [
          "Input: $2.50/MTok",
          "Output: $10.00/MTok",
          "Fast and multimodal",
          "Good balance of cost and quality",
        ],
        bestFor: "General-purpose API usage with multimodal capabilities",
      },
      {
        id: "openai-api-gpt4o-mini",
        name: "API — GPT-4o Mini",
        pricePerUserPerMonth: 0,
        isPerSeat: false,
        features: [
          "Input: $0.15/MTok",
          "Output: $0.60/MTok",
          "Lightweight and fast",
          "Very cost-effective",
        ],
        bestFor:
          "High-volume, cost-sensitive tasks (classification, summarization)",
      },
    ],
  },
];

// ============================================================
// Helper Functions
// ============================================================

/** Get a tool by ID */
export function getToolById(toolId: string): Tool | undefined {
  return TOOLS.find((t) => t.id === toolId);
}

/** Get a plan by tool ID and plan ID */
export function getPlanById(
  toolId: string,
  planId: string
): Plan | undefined {
  const tool = getToolById(toolId);
  return tool?.plans.find((p) => p.id === planId);
}

/** Get all tools in a category */
export function getToolsByCategory(category: Tool["category"]): Tool[] {
  return TOOLS.filter((t) => t.category === category);
}

/** Get all tools suitable for a use case */
export function getToolsForUseCase(useCase: string): Tool[] {
  return TOOLS.filter((t) => t.useCases.includes(useCase as UseCase));
}

/** Calculate monthly cost for a tool + plan + seats */
export function calculateMonthlyCost(
  plan: Plan,
  seats: number
): number {
  if (plan.isPerSeat) {
    return plan.pricePerUserPerMonth * seats;
  }
  return plan.pricePerUserPerMonth;
}

/** Get comparable tools (same category, similar use cases) */
export function getComparableTools(
  toolId: string,
  useCase: string
): Tool[] {
  const tool = getToolById(toolId);
  if (!tool) return [];

  return TOOLS.filter(
    (t) =>
      t.id !== toolId &&
      t.category === tool.category &&
      t.useCases.includes(useCase as UseCase)
  );
}

/** Non-API tools only (subscription-based) */
export function getSubscriptionTools(): Tool[] {
  return TOOLS.filter((t) => t.category !== "api-platform");
}

/** API tools only */
export function getApiTools(): Tool[] {
  return TOOLS.filter((t) => t.category === "api-platform");
}
