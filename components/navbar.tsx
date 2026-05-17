"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { ArrowRight } from "lucide-react";

interface NavbarProps {
  showAuditCta?: boolean;
  maxWidth?: string;
}

export function Navbar({ showAuditCta = true, maxWidth = "max-w-6xl" }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className={`mx-auto flex h-14 items-center justify-between px-6 ${maxWidth}`}>
        <Logo size="md" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {showAuditCta && (
            <Link
              href="/audit"
              className="group inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Start Audit
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
