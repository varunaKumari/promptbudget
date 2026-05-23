"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, CheckCircle, ArrowRight, Loader2 } from "lucide-react";
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
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-lg border border-success/20 bg-success/[0.04] p-8 text-center"
      >
        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
          <CheckCircle className="h-6 w-6 text-success" />
        </div>
        <h3 className="mb-2 text-lg font-semibold">Report saved</h3>
        <p className="text-sm text-muted-foreground">
          Check your email for a link to this report. We&apos;ll notify you when
          new optimizations apply to your stack.
        </p>
      </motion.div>
    );
  }

  const isHighSavings = savingsAmount >= 500;

  return (
    <div className="flat-card rounded-lg p-6">
      <div className="mb-1 flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">
          {isHighSavings
            ? "Save this report & get a consultation"
            : "Save this report"}
        </h3>
      </div>
      <p className="mb-5 text-xs text-muted-foreground">
        {isHighSavings
          ? `With $${savingsAmount.toLocaleString()}/mo in potential savings, Credex can help capture even more through discounted credits.`
          : "Get a link to this report and notifications when new optimizations apply."}
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Honeypot field */}
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
          <Label htmlFor="lead-email" className="text-xs">Work email *</Label>
          <Input
            id="lead-email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="lead-company" className="text-xs">Company</Label>
            <Input
              id="lead-company"
              type="text"
              placeholder="Acme Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="lead-role" className="text-xs">Role</Label>
            <Input
              id="lead-role"
              type="text"
              placeholder="Eng Manager"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-xs text-danger"
              role="alert"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-md"
          size="default"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Saving...
            </>
          ) : isHighSavings ? (
            <>
              Save & book consultation
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </>
          ) : (
            "Save my report"
          )}
        </Button>

        <p className="text-center text-[10px] text-muted-foreground">
          No spam. Only savings opportunities.
        </p>
      </form>
    </div>
  );
}
