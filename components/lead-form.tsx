"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LeadFormProps {
  auditId: string;
  savingsAmount: number;
  onSuccess?: () => void;
}

export function LeadForm({ auditId, savingsAmount, onSuccess }: LeadFormProps) {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          companyName: companyName || undefined,
          role: role || undefined,
          auditId,
          honeypot,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setIsSubmitted(true);
      onSuccess?.();
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
        <div className="mb-3 text-4xl">✅</div>
        <h3 className="mb-2 text-xl font-semibold text-foreground">
          Report Saved!
        </h3>
        <p className="text-muted-foreground">
          Check your email for a link to this report. We&apos;ll notify you when
          new optimizations apply to your stack.
        </p>
      </div>
    );
  }

  const isHighSavings = savingsAmount >= 500;

  return (
    <div className="rounded-2xl border border-border bg-card p-8">
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        {isHighSavings
          ? "🔥 You Could Save Big — Let's Talk"
          : "📧 Save This Report"}
      </h3>
      <p className="mb-6 text-muted-foreground">
        {isHighSavings
          ? `With $${savingsAmount.toLocaleString()}/mo in potential savings, Credex can help you capture even more through discounted AI credits. Enter your email to save this report and get a personalized consultation.`
          : "Enter your email to save this report and get notified when new optimizations apply to your stack."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field — hidden from users, visible to bots */}
        <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="lead-email">Work Email *</Label>
          <Input
            id="lead-email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lead-company">Company Name</Label>
            <Input
              id="lead-company"
              type="text"
              placeholder="Acme Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <Label htmlFor="lead-role">Your Role</Label>
            <Input
              id="lead-role"
              type="text"
              placeholder="Eng Manager"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting
            ? "Saving..."
            : isHighSavings
              ? "Save Report & Book Consultation"
              : "Save My Report"}
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          No spam. We&apos;ll only reach out about savings opportunities.
        </p>
      </form>
    </div>
  );
}
