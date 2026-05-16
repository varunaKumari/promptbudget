"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/navbar";
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

const USE_CASE_OPTIONS: { value: UseCase; label: string }[] = [
  { value: "coding", label: "💻 Coding & Development" },
  { value: "writing", label: "✍️ Writing & Content" },
  { value: "data", label: "📊 Data & Analytics" },
  { value: "research", label: "🔬 Research & Analysis" },
  { value: "mixed", label: "🔄 Mixed / All of the above" },
];

export default function AuditPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load persisted form state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as FormState;
        setForm(parsed);
      }
    } catch {
      // Ignore parse errors
    }
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

    // Don't add duplicates
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

  // Remove a tool
  const removeTool = (index: number) => {
    const next = form.tools.filter((_, i) => i !== index);
    updateForm({ tools: next });
  };

  // Update a tool entry
  const updateTool = (index: number, updates: Partial<ToolEntry>) => {
    const next = form.tools.map((t, i) => {
      if (i !== index) return t;
      const updated = { ...t, ...updates };

      // Auto-calculate monthly spend when plan or seats change
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

  // Submit the audit
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

      // Cache results in sessionStorage so the results page can render
      // immediately without waiting for Supabase (fallback for missing tables)
      try {
        sessionStorage.setItem(
          `audit_${data.data.id}`,
          JSON.stringify(data.data.results)
        );
      } catch {
        // Ignore storage errors
      }

      // Navigate to results
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar showAuditCta={false} maxWidth="max-w-4xl" />

      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10">
          <h1 className="mb-3 text-3xl font-bold tracking-tight md:text-4xl">
            Audit Your AI Spend
          </h1>
          <p className="text-lg text-muted-foreground">
            Add every AI tool you pay for. Be honest — the audit is only as
            good as the data you give it.
          </p>
        </div>

        {/* Team Info */}
        <section className="mb-8 rounded-2xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Team Information</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="team-size">Team Size</Label>
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
                Total people using AI tools on your team
              </p>
            </div>
            <div>
              <Label htmlFor="use-case">Primary Use Case</Label>
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
        </section>

        {/* Added Tools */}
        {form.tools.length > 0 && (
          <section className="mb-8 space-y-4">
            <h2 className="text-lg font-semibold">
              Your AI Tools ({form.tools.length})
            </h2>
            {form.tools.map((entry, index) => {
              const tool = TOOLS.find((t) => t.id === entry.toolId);
              if (!tool) return null;

              return (
                <div
                  key={`${entry.toolId}-${index}`}
                  className="rounded-2xl border border-border bg-card p-6 transition-all hover:border-foreground/10"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tool.icon}</span>
                      <h3 className="text-lg font-semibold">{tool.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTool(index)}
                      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      aria-label={`Remove ${tool.name}`}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <Label htmlFor={`plan-${index}`}>Plan</Label>
                      <Select
                        value={entry.planId}
                        onValueChange={(v) =>
                          updateTool(index, { planId: v })
                        }
                      >
                        <SelectTrigger id={`plan-${index}`} className="mt-1.5">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {tool.plans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name}
                              {plan.pricePerUserPerMonth > 0 &&
                                ` — $${plan.pricePerUserPerMonth}${plan.isPerSeat ? "/user" : ""}/mo`}
                              {plan.pricePerUserPerMonth === 0 && " — Free"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`seats-${index}`}>Seats / Users</Label>
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
                      <Label htmlFor={`spend-${index}`}>Monthly Spend ($)</Label>
                      <Input
                        id={`spend-${index}`}
                        type="number"
                        min={0}
                        step={0.01}
                        value={entry.monthlySpend}
                        onChange={(e) =>
                          updateTool(index, {
                            monthlySpend: Math.max(
                              0,
                              parseFloat(e.target.value) || 0
                            ),
                          })
                        }
                        className="mt-1.5"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        What you actually pay (override if different)
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* Add Tool Selector */}
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Add a Tool</h2>

          {/* Subscription Tools */}
          {availableSubTools.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm text-muted-foreground">
                Coding & Chat Tools
              </p>
              <div className="flex flex-wrap gap-2">
                {availableSubTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => addTool(tool.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-all hover:border-foreground/20 hover:bg-muted hover:scale-105"
                  >
                    <span>{tool.icon}</span>
                    {tool.name}
                    <span className="text-muted-foreground">+</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* API Tools */}
          {availableApiTools.length > 0 && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                API Platforms (direct usage)
              </p>
              <div className="flex flex-wrap gap-2">
                {availableApiTools.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => addTool(tool.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-all hover:border-foreground/20 hover:bg-muted hover:scale-105"
                  >
                    <span>{tool.icon}</span>
                    {tool.name}
                    <span className="text-muted-foreground">+</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {availableSubTools.length === 0 && availableApiTools.length === 0 && (
            <p className="text-sm text-muted-foreground">
              All supported tools have been added.
            </p>
          )}
        </section>

        {/* Summary + Submit */}
        {form.tools.length > 0 && (
          <section className="sticky bottom-0 z-40 -mx-6 border-t border-border bg-background/95 px-6 py-6 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {form.tools.length} tool{form.tools.length > 1 ? "s" : ""} ·{" "}
                  {form.teamSize} team member{form.teamSize > 1 ? "s" : ""}
                </p>
                <p className="text-2xl font-bold">
                  ${totalMonthlySpend.toLocaleString()}
                  <span className="text-base font-normal text-muted-foreground">
                    /month total
                  </span>
                </p>
              </div>

              <Button
                size="lg"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="min-w-[200px] rounded-full text-lg"
              >
                {isSubmitting ? "Analyzing..." : "Run My Audit →"}
              </Button>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-500" role="alert">
                {error}
              </p>
            )}
          </section>
        )}

        {/* Empty State */}
        {form.tools.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-border p-12 text-center">
            <p className="mb-2 text-4xl">👆</p>
            <p className="text-lg font-medium text-muted-foreground">
              Click a tool above to start your audit
            </p>
            <p className="text-sm text-muted-foreground">
              Add every AI tool your team pays for — subscriptions and API usage
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
