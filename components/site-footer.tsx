import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const footerColumns = [
  {
    title: "Product",
    links: [
      "AI Cost Tracking",
      "Usage Analytics",
      "Budget Forecasting",
      "Team Management",
      "Vendor Insights",
      "Savings Recommendations",
      "API Access",
    ],
  },
  {
    title: "Platform",
    links: [
      "Dashboard",
      "Reports",
      "Integrations",
      "Alerts",
      "Multi-workspace",
      "AI Audit Logs",
      "Security",
    ],
  },
  {
    title: "Resources",
    links: [
      "Documentation",
      "API Docs",
      "Blog",
      "Pricing",
      "Changelog",
      "Help Center",
      "Community",
    ],
  },
  {
    title: "Company",
    links: ["About", "Careers", "Contact", "Privacy Policy", "Terms of Service"],
  },
];

const socialLinks = [
  { label: "GitHub", href: "https://github.com", shortLabel: "GH" },
  { label: "LinkedIn", href: "https://linkedin.com", shortLabel: "in" },
  { label: "X", href: "https://x.com", shortLabel: "X" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#0B0B0B] text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 translate-x-1/3 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-16 left-0 h-72 w-72 -translate-x-1/3 rounded-full bg-white/5 blur-3xl" />

      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        <section
          aria-labelledby="footer-cta-title"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-black/30 backdrop-blur md:p-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(184,255,0,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)] opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_minmax(360px,520px)] lg:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-medium text-white/70">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                AI spend command center
              </div>
              <h2
                id="footer-cta-title"
                className="max-w-2xl text-2xl font-semibold tracking-normal text-white sm:text-3xl lg:text-4xl"
              >
                Track and reduce AI spending with confidence.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/58">
                Bring every AI subscription, seat, API bill, and savings opportunity into one clear operating view.
              </p>
            </div>

            <form action="/audit" className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-primary/20 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex flex-col overflow-hidden rounded-xl border border-white/12 bg-[#1A1A1A]/95 p-1.5 shadow-xl shadow-black/30 sm:flex-row">
                <label htmlFor="footer-work-email" className="sr-only">
                  Work email
                </label>
                <input
                  id="footer-work-email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="What's your work email?"
                  className="min-h-12 flex-1 rounded-lg border-0 bg-transparent px-4 text-sm text-white placeholder:text-white/46 outline-none transition-colors focus:bg-white/[0.03]"
                />
                <button
                  type="submit"
                  className="group/button inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-[0_0_28px_rgba(184,255,0,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_42px_rgba(184,255,0,0.38)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0B0B]"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/button:translate-x-0.5" />
                </button>
              </div>
            </form>
          </div>
        </section>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(220px,1.15fr)_3fr] lg:gap-14">
          <section aria-label="PromptBudget" className="max-w-sm">
            <Link href="/" className="group inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-black shadow-[0_0_28px_rgba(184,255,0,0.2)] transition-transform duration-200 group-hover:-translate-y-0.5">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="text-lg font-semibold tracking-normal">PromptBudget</span>
            </Link>
            <p className="mt-4 text-sm font-medium text-white/82">
              AI Spend Intelligence for Modern Teams
            </p>
            <p className="mt-3 text-sm leading-6 text-white/50">
              Audit your AI stack, forecast budget pressure, and find savings across subscriptions, seats, and usage.
            </p>

            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-[11px] font-semibold text-white/56 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                >
                  {item.shortLabel}
                </a>
              ))}
            </div>
          </section>

          <nav
            aria-label="Footer navigation"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            {footerColumns.map((column) => (
              <section
                key={column.title}
                className="rounded-xl border border-transparent p-1 transition-all duration-200 hover:border-white/8 hover:bg-white/[0.025] sm:p-4"
              >
                <h3 className="text-sm font-semibold text-white">{column.title}</h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link}>
                      <Link
                        href={getFooterHref(link)}
                        className="group/link inline-flex text-sm text-white/52 transition-colors duration-200 hover:text-white"
                      >
                        <span className="bg-gradient-to-r from-primary to-primary bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size,color] duration-200 group-hover/link:bg-[length:100%_1px]">
                          {link}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>

        <div className="mt-14 border-t border-white/10 pt-7">
          <div className="flex flex-col gap-4 text-xs leading-5 text-white/42 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="font-medium text-white/62">
                Copyright {year} PromptBudget. All rights reserved.
              </p>
              <p className="mt-1">
                Built for startups &amp; modern AI teams.
              </p>
            </div>
            <p className="max-w-2xl lg:text-right">
              Pricing intelligence is provided for planning purposes only. Vendor pricing, usage limits, and discounts can change; always verify final purchasing decisions with the official provider.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function getFooterHref(label: string): string {
  const hrefs: Record<string, string> = {
    "AI Cost Tracking": "/audit",
    "Usage Analytics": "/audit",
    "Budget Forecasting": "/audit",
    "Team Management": "/audit",
    "Vendor Insights": "/#benchmarks",
    "Savings Recommendations": "/audit",
    "API Access": "/audit",
    Dashboard: "/audit",
    Reports: "/audit",
    Integrations: "/audit",
    Alerts: "/audit",
    "Multi-workspace": "/audit",
    "AI Audit Logs": "/audit",
    Security: "/audit",
    Documentation: "/audit",
    "API Docs": "/audit",
    Blog: "/#insights",
    Pricing: "/#pricing",
    Changelog: "/#changelog",
    "Help Center": "/#help",
    Community: "/#community",
    About: "/#about",
    Careers: "/#careers",
    Contact: "mailto:hello@promptbudget.app",
    "Privacy Policy": "/#privacy",
    "Terms of Service": "/#terms",
  };

  return hrefs[label] || "/";
}
