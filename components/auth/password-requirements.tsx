"use client";

import { CheckCircle2, Circle } from "lucide-react";
import type { PasswordValidationItem } from "@/lib/auth";

interface PasswordRequirementsProps {
  validation: PasswordValidationItem[];
}

export function PasswordRequirements({ validation }: PasswordRequirementsProps) {
  return (
    <div className="space-y-1 text-sm" aria-live="polite">
      {validation.map((rule) => (
        <div key={rule.id} className="flex items-center gap-2 text-left text-[13px] leading-5">
          {rule.isValid ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
          <span className={rule.isValid ? "text-foreground" : "text-muted-foreground"}>{rule.label}</span>
        </div>
      ))}
    </div>
  );
}
