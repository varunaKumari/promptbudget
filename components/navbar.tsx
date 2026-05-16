"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavbarProps {
  showAuditCta?: boolean;
  maxWidth?: string;
}

export function Navbar({ showAuditCta = true, maxWidth = "max-w-6xl" }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className={`mx-auto flex h-16 items-center justify-between px-6 ${maxWidth}`}>
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span className="text-2xl">📊</span>
          <span>PromptBudget</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          {showAuditCta && (
            <Link
              href="/audit"
              className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:opacity-90 hover:scale-105"
            >
              Start Free Audit →
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
