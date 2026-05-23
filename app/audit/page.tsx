"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  ChevronRight,
  Loader2,
  Sparkles,
  Users,
  Briefcase,
  BadgeDollarSign,
  BarChart3,
  PieChart,
  SearchCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/navbar";
import { FadeIn, SlideUp, CountUp } from "@/components/ui/motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TOOLS, getSubscriptionTools, getApiTools } from "@/lib/pricing-data";
import type { ToolEntry, UseCase } from "@/lib/types";

const STORAGE_KEY = "promptbudget_audit_form";

interface FormState {
  tools: ToolEntry[];
  teamSize: number;
  primaryUseCase: UseCase;
}

const DEFAULT_FORM_STATE: FormState = {
  tools: [],
  teamSize: 1,
  primaryUseCase: "coding",
};

const USE_CASE_OPTIONS: { value: UseCase; label: string; icon: React.ReactNode }[] = [
  { value: "coding", label: "Coding & Development", icon: <span className="text-xs">{"</>"}</span> },
  { value: "writing", label: "Writing & Content", icon: <span className="text-xs">✎</span> },
  { value: "data", label: "Data & Analytics", icon: <span className="text-xs">▥</span> },
  { value: "research", label: "Research & Analysis", icon: <span className="text-xs">◎</span> },
  { value: "mixed", label: "Mixed / All of the above", icon: <span className="text-xs">⊞</span> },
];

// Quick-start presets for common team configurations
const PRESETS = [
  {
    label: "Solo Developer",
    teamSize: 1,
    tools: [
      { toolId: "cursor", planId: "cursor-pro", seats: 1, monthlySpend: 20 },
      { toolId: "claude", planId: "claude-pro", seats: 1, monthlySpend: 20 },
    ],
  },
  {
    label: "Seed Team (5)",
    teamSize: 5,
    tools: [
      { toolId: "cursor", planId: "cursor-teams", seats: 5, monthlySpend: 200 },
      { toolId: "claude", planId: "claude-team-standard", seats: 5, monthlySpend: 125 },
      { toolId: "chatgpt", planId: "chatgpt-plus", seats: 5, monthlySpend: 100 },
    ],
  },
  {
    label: "Series A (15)",
    teamSize: 15,
    tools: [
      { toolId: "cursor", planId: "cursor-teams", seats: 15, monthlySpend: 600 },
      { toolId: "github-copilot", planId: "copilot-business", seats: 15, monthlySpend: 285 },
      { toolId: "claude", planId: "claude-team-standard", seats: 15, monthlySpend: 375 },
      { toolId: "chatgpt", planId: "chatgpt-business", seats: 15, monthlySpend: 375 },
    ],
  },
];

export default function AuditPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load persisted form state
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as FormState;
          setForm(parsed);
        }
      } catch {
        // Ignore parse errors
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // Persist form state on changes
  const persistForm = useCallback((state: FormState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const updateForm = useCallback(
    (updates: Partial<FormState>) => {
      setForm((prev) => {
        const next = { ...prev, ...updates };
        persistForm(next);
        return next;
      });
    },
    [persistForm]
  );

  // Add a tool to the form
  const addTool = (toolId: string) => {
    const tool = TOOLS.find((t) => t.id === toolId);
    if (!tool) return;
    if (form.tools.some((t) => t.toolId === toolId)) return;

    const defaultPlan = tool.plans.find((p) => p.pricePerUserPerMonth > 0) || tool.plans[0];
    const newEntry: ToolEntry = {
      toolId,
      planId: defaultPlan.id,
      seats: 1,
      monthlySpend: defaultPlan.isPerSeat
        ? defaultPlan.pricePerUserPerMonth
        : defaultPlan.pricePerUserPerMonth,
    };

    updateForm({ tools: [...form.tools, newEntry] });
  };

  const removeTool = (index: number) => {
    const next = form.tools.filter((_, i) => i !== index);
    updateForm({ tools: next });
  };

  const updateTool = (index: number, updates: Partial<ToolEntry>) => {
    const next = form.tools.map((t, i) => {
      if (i !== index) return t;
      const updated = { ...t, ...updates };
      if (updates.planId || updates.seats !== undefined) {
        const tool = TOOLS.find((tl) => tl.id === updated.toolId);
        const plan = tool?.plans.find((p) => p.id === updated.planId);
        if (plan) {
          updated.monthlySpend = plan.isPerSeat
            ? plan.pricePerUserPerMonth * updated.seats
            : plan.pricePerUserPerMonth;
        }
      }
      return updated;
    });
    updateForm({ tools: next });
  };

  const applyPreset = (preset: typeof PRESETS[number]) => {
    updateForm({
      tools: preset.tools,
      teamSize: preset.teamSize,
    });
  };

  const handleSubmit = async () => {
    if (form.tools.length === 0) {
      setError("Add at least one AI tool to audit.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            tools: form.tools,
            teamSize: form.teamSize,
            primaryUseCase: form.primaryUseCase,
          },
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      try {
        sessionStorage.setItem(
          `audit_${data.data.id}`,
          JSON.stringify(data.data.results)
        );
      } catch {
        // Ignore storage errors
      }
      router.push(`/results/${data.data.id}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subscriptionTools = getSubscriptionTools();
  const apiTools = getApiTools();
  const availableSubTools = subscriptionTools.filter(
    (t) => !form.tools.some((ft) => ft.toolId === t.id)
  );
  const availableApiTools = apiTools.filter(
    (t) => !form.tools.some((ft) => ft.toolId === t.id)
  );

  const totalMonthlySpend = form.tools.reduce((sum, t) => sum + t.monthlySpend, 0);
  const totalAnnualSpend = totalMonthlySpend * 12;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar showAuditCta={false} maxWidth="max-w-7xl" />

      <main className="flex-1">
        <section className="relative border-b border-border px-5 py-12 md:px-8 md:py-16">
          <div className="pointer-events-none absolute inset-0 dot-grid opacity-60" />
          <div className="relative mx-auto max-w-7xl">
            <p className="mb-4 text-sm font-semibold text-muted-foreground">
              AI spend audit
            </p>
            <div className="grid gap-8 lg:grid-cols-[0.74fr_0.42fr] lg:items-end">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-normal md:text-7xl">
                Build the report your AI budget has been missing.
              </h1>
              <p className="text-lg leading-relaxed text-muted-foreground">
                Add your paid AI tools, seats, and plans. PromptBudget turns the
                stack into a savings report with specific actions.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-4 px-5 pt-8 sm:grid-cols-2 md:px-8 xl:grid-cols-4">
          {[
            {
              title: "AI spend analytics",
              description: "Track monthly spend, annual run rate, and per-seat budget pressure.",
              icon: BarChart3,
            },
            {
              title: "Waste detection",
              description: "Find duplicate seats, wrong plans, and overlapping subscriptions.",
              icon: SearchCheck,
            },
            {
              title: "Tool usage breakdown",
              description: "Separate seat-based subscriptions from API and usage-based tools.",
              icon: PieChart,
            },
            {
              title: "Savings recommendations",
              description: "Get ranked actions with estimated monthly and annual savings.",
              icon: BadgeDollarSign,
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-lg hover:shadow-foreground/5"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-transform duration-200 group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </article>
            );
          })}
        </section>

        <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-10 md:px-8 lg:grid-cols-[1fr_330px]">
          <div>
        {/* Page Header */}
        <SlideUp className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="mb-2 text-2xl font-semibold tracking-normal md:text-3xl">
                Your stack
              </h2>
              <p className="text-sm text-muted-foreground">
                Start with a preset or add every tool your team pays for.
              </p>
            </div>
            {/* Step indicator */}
            <div className="hidden items-center gap-1.5 text-xs text-muted-foreground md:flex">
              <span className="rounded bg-primary/10 px-2 py-1 font-medium text-primary">
                1. Input
              </span>
              <ChevronRight className="h-3 w-3" />
              <span className="rounded px-2 py-1">2. Results</span>
            </div>
          </div>
        </SlideUp>

        {/* Quick-Start Presets */}
        {form.tools.length === 0 && (
          <FadeIn delay={0.1} className="mb-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Quick start - pick a common stack
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="group rounded-md border border-border bg-card p-4 text-left transition-all hover:border-foreground/30 hover:bg-accent/25"
                >
                  <div className="mb-1 text-sm font-semibold">{preset.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {preset.tools.length} tools / {preset.teamSize} user{preset.teamSize > 1 ? "s" : ""}
                  </div>
                </button>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Team Info */}
        <FadeIn delay={0.15} className="mb-8">
          <div className="flat-card rounded-lg p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <Users className="h-4 w-4 text-muted-foreground" />
              Team
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="team-size" className="text-xs">Team Size</Label>
                <Input
                  id="team-size"
                  type="number"
                  min={1}
                  max={10000}
                  value={form.teamSize}
                  onChange={(e) =>
                    updateForm({ teamSize: Math.max(1, parseInt(e.target.value) || 1) })
                  }
                  className="mt-1.5"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  People using AI tools on your team
                </p>
              </div>
              <div>
                <Label htmlFor="use-case" className="text-xs">Primary Use Case</Label>
                <Select
                  value={form.primaryUseCase}
                  onValueChange={(v) => updateForm({ primaryUseCase: v as UseCase })}
                >
                  <SelectTrigger id="use-case" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {USE_CASE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Added Tools */}
        <AnimatePresence mode="popLayout">
          {form.tools.map((entry, index) => {
            const tool = TOOLS.find((t) => t.id === entry.toolId);
            if (!tool) return null;

            return (
              <motion.div
                key={`${entry.toolId}-${index}`}
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, ease: [0.21, 0.47, 0.32, 0.98] }}
              >
                <div className="flat-card rounded-lg p-5 transition-colors hover:border-foreground/20">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-base">
                        {tool.icon}
                      </div>
                      <span className="text-sm font-semibold">{tool.name}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTool(index)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
                      aria-label={`Remove ${tool.name}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor={`plan-${index}`} className="text-xs">Plan</Label>
                      <Select
                        value={entry.planId}
                        onValueChange={(v) => updateTool(index, { planId: v })}
                      >
                        <SelectTrigger id={`plan-${index}`} className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tool.plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name}
                              {plan.pricePerUserPerMonth > 0 &&
                                ` - $${plan.pricePerUserPerMonth}${plan.isPerSeat ? "/user" : ""}/mo`}
                              {plan.pricePerUserPerMonth === 0 && " - Free"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`seats-${index}`} className="text-xs">Seats</Label>
                      <Input
                        id={`seats-${index}`}
                        type="number"
                        min={1}
                        max={10000}
                        value={entry.seats}
                        onChange={(e) =>
                          updateTool(index, {
                            seats: Math.max(1, parseInt(e.target.value) || 1),
                          })
                        }
                        className="mt-1.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor={`spend-${index}`} className="text-xs">Monthly Spend ($)</Label>
                      <Input
                        id={`spend-${index}`}
                        type="number"
                        min={0}
                        step={0.01}
                        value={entry.monthlySpend}
                        onChange={(e) =>
                          updateTool(index, {
                            monthlySpend: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="mt-1.5 font-tabular"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Override if different from calculated
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add Tool Selector */}
        <FadeIn delay={0.2} className="mb-8">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            {form.tools.length > 0 ? "Add more tools" : "Add your tools"}
          </div>

          {/* Subscription Tools */}
          {availableSubTools.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs text-muted-foreground">
                Coding & Chat Tools
              </p>
              <div className="flex flex-wrap gap-2">
                {availableSubTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => addTool(tool.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <span className="text-xs">{tool.icon}</span>
                    <span className="font-medium">{tool.name}</span>
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* API Tools */}
          {availableApiTools.length > 0 && (
            <div>
              <p className="mb-2 text-xs text-muted-foreground">
                API Platforms
              </p>
              <div className="flex flex-wrap gap-2">
                {availableApiTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => addTool(tool.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <span className="text-xs">{tool.icon}</span>
                    <span className="font-medium">{tool.name}</span>
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableSubTools.length === 0 && availableApiTools.length === 0 && (
            <p className="text-sm text-muted-foreground">
              All supported tools added.
            </p>
          )}
        </FadeIn>

        {/* Empty State */}
        {form.tools.length === 0 && (
          <FadeIn delay={0.3}>
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Sparkles className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mb-1 text-sm font-medium text-muted-foreground">
                Click a tool above or pick a preset
              </p>
              <p className="text-xs text-muted-foreground">
                Add every AI tool your team pays for: subscriptions and API usage
              </p>
            </div>
          </FadeIn>
        )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-lg border border-border bg-surface p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                What you get
              </p>
              <h2 className="mb-4 text-2xl font-semibold leading-tight">
                A finance-ready AI spend report.
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
                <p>Plan-fit checks across subscription tools.</p>
                <p>Per-tool savings ranked by confidence.</p>
                <p>Benchmark comparison for your team size.</p>
                <p>Shareable URL for budget reviews.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Sticky Submit Bar */}
      <AnimatePresence>
        {form.tools.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8">
              <div>
                <p className="text-xs text-muted-foreground">
                  {form.tools.length} tool{form.tools.length > 1 ? "s" : ""} ·{" "}
                  {form.teamSize} member{form.teamSize > 1 ? "s" : ""}
                </p>
                <p className="text-xl font-bold font-tabular">
                  $<CountUp value={totalMonthlySpend} />
                  <span className="text-sm font-normal text-muted-foreground">
                    /mo
                  </span>
                  <span className="ml-3 text-sm font-normal text-muted-foreground">
                    ${totalAnnualSpend.toLocaleString()}/yr
                  </span>
                </p>
              </div>

              <Button
                size="lg"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="min-w-[180px] rounded-md"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Run audit
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="mx-auto max-w-7xl px-5 pb-3 md:px-8">
                <p className="text-sm text-danger" role="alert">
                  {error}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
