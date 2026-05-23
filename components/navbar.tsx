"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  FileText,
  Menu,
  PieChart,
  ShieldCheck,
  X,
} from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AuthNavActions } from "@/components/auth/auth-nav-actions";

interface NavbarProps {
  showAuditCta?: boolean;
  maxWidth?: string;
}

const productItems = [
  {
    title: "AI spend audit",
    description: "Find waste across seats, plans, and overlapping tools.",
    icon: BarChart3,
    href: "/audit",
  },
  {
    title: "Benchmarks",
    description: "Compare AI spend against teams at your stage.",
    icon: PieChart,
    href: "/benchmarks",
  },
  {
    title: "Reports",
    description: "Share CFO-ready recommendations with exact savings.",
    icon: FileText,
    href: "/reports",
  },
  {
    title: "Pricing data",
    description: "Vendor pricing tracked and refreshed for clear math.",
    icon: ShieldCheck,
    href: "/pricing",
  },
];

const mobileItems = [
  { label: "Product", href: "/" },
  { label: "Audit", href: "/audit" },
  { label: "Benchmarks", href: "/benchmarks" },
  { label: "Reports", href: "/reports" },
  { label: "Pricing", href: "/pricing" },
];

export function Navbar({ showAuditCta = true, maxWidth = "max-w-7xl" }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl"
      onMouseLeave={() => setMegaOpen(false)}
    >
      <div className={`mx-auto flex h-16 items-center justify-between px-5 md:px-8 ${maxWidth}`}>
        <div className="flex items-center gap-8">
          <Logo size="md" />
          <div className="hidden items-center gap-7 text-sm font-medium text-foreground/80 md:flex">
            <button
              type="button"
              onMouseEnter={() => setMegaOpen(true)}
              onFocus={() => setMegaOpen(true)}
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              Product
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
            </button>
            <Link href="/audit" className="transition-colors hover:text-foreground">
              Audit
            </Link>
            <Link href="/benchmarks" className="transition-colors hover:text-foreground">
              Benchmarks
            </Link>
            <Link href="/reports" className="transition-colors hover:text-foreground">
              Reports
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground">
              Pricing
            </Link>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <AuthNavActions />
          <ThemeToggle />
          {showAuditCta && (
            <Link
              href="/audit/start"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 lime-shadow"
            >
              Start audit
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {megaOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 right-0 top-16 hidden border-b border-border bg-background/96 shadow-[0_24px_60px_oklch(0_0_0_/_8%)] backdrop-blur-xl md:block"
          >
            <div className="mx-auto grid max-w-7xl grid-cols-[1fr_320px] gap-8 px-8 py-8">
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
                {productItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mb-1 text-base font-semibold">{item.title}</p>
                      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
              <div className="rounded-lg bg-surface p-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Featured
                </p>
                <h3 className="mb-2 text-2xl font-semibold leading-tight">
                  See where your AI budget leaks.
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  Run the audit, get a ranked savings list, and share a report your finance team can trust.
                </p>
                <Link href="/audit/start" className="inline-flex items-center text-sm font-semibold">
                  Run the free audit
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <div className="space-y-1 px-5 py-4">
              {mobileItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <AuthNavActions mobile onNavigate={() => setMenuOpen(false)} />
              {showAuditCta && (
                <Link
                  href="/audit/start"
                  className="mt-3 flex h-11 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
                  onClick={() => setMenuOpen(false)}
                >
                  Start audit
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
