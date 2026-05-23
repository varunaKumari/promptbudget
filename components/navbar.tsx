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

export function Navbar({ maxWidth = "max-w-7xl" }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border bg-background/90 text-foreground shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#080b12]/90 dark:text-white dark:shadow-[0_18px_60px_rgba(0,0,0,0.28)]"
      onMouseLeave={() => setMegaOpen(false)}
    >
      <div className={`mx-auto flex h-16 items-center justify-between px-5 md:px-8 ${maxWidth}`}>
        <div className="flex items-center gap-8">
          <Logo size="md" />
          <div className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex dark:text-white/68">
            <button
              type="button"
              onMouseEnter={() => setMegaOpen(true)}
              onFocus={() => setMegaOpen(true)}
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground dark:hover:text-white"
            >
              Product
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${megaOpen ? "rotate-180" : ""}`} />
            </button>
            <Link href="/audit" className="transition-colors hover:text-foreground dark:hover:text-white">
              Audit
            </Link>
            <Link href="/benchmarks" className="transition-colors hover:text-foreground dark:hover:text-white">
              Benchmarks
            </Link>
            <Link href="/reports" className="transition-colors hover:text-foreground dark:hover:text-white">
              Reports
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-foreground dark:hover:text-white">
              Pricing
            </Link>
          </div>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-full px-3 text-sm font-semibold text-muted-foreground transition-all hover:bg-muted hover:text-foreground dark:text-white/72 dark:hover:bg-white/6 dark:hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm transition-all hover:bg-muted dark:border-white/16 dark:bg-white/[0.03] dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:hover:border-white/28 dark:hover:bg-white/[0.08]"
          >
            Contact
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-10 items-center justify-center rounded-full bg-blue-500 px-5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(59,130,246,0.35)] transition-all hover:-translate-y-0.5 hover:bg-blue-400"
          >
            Sign up
          </Link>
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground md:hidden dark:border-white/12 dark:bg-white/[0.04] dark:text-white"
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
            className="absolute left-0 right-0 top-16 hidden border-b border-border bg-background/96 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl md:block dark:border-white/10 dark:bg-[#080b12]/96 dark:shadow-[0_24px_60px_rgba(0,0,0,0.34)]"
          >
            <div className="mx-auto grid max-w-7xl grid-cols-[1fr_320px] gap-8 px-8 py-8">
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10">
                {productItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="group bg-[#0d111a] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#111827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    >
                      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-blue-500 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="mb-1 text-base font-semibold">{item.title}</p>
                      <p className="max-w-sm text-sm leading-relaxed text-white/56">
                        {item.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/44">
                  Featured
                </p>
                <h3 className="mb-2 text-2xl font-semibold leading-tight">
                  See where your AI budget leaks.
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-white/58">
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
            className="overflow-hidden border-t border-border bg-background md:hidden dark:border-white/10 dark:bg-[#080b12]"
          >
            <div className="space-y-1 px-5 py-4">
              {mobileItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:text-white/72 dark:hover:bg-white/[0.06] dark:hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="grid gap-2 pt-3">
                <div className="flex items-center justify-between rounded-md px-3 py-2">
                  <span className="text-sm font-medium text-muted-foreground dark:text-white/64">Theme</span>
                  <ThemeToggle />
                </div>
                <Link
                  href="/login"
                  className="flex h-11 items-center justify-center rounded-full text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:text-white/72 dark:hover:bg-white/[0.06] dark:hover:text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/contact"
                  className="flex h-11 items-center justify-center rounded-full border border-white/14 bg-white/[0.03] text-sm font-semibold text-white"
                  onClick={() => setMenuOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  href="/signup"
                  className="flex h-11 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(59,130,246,0.32)]"
                  onClick={() => setMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
