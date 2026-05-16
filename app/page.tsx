import Link from "next/link";
import type { Metadata } from "next";
import { ToolCard } from "@/components/tool-card";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "PromptBudget — Free AI Spend Audit for Startups",
  description:
    "Find out if you're overspending on AI tools. Get a free, instant audit of your Cursor, Copilot, Claude, ChatGPT, and Gemini subscriptions — with actionable savings.",
  openGraph: {
    title: "PromptBudget — Free AI Spend Audit for Startups",
    description:
      "Find out if you're overspending on AI tools. Instant audit. Real savings.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptBudget — Free AI Spend Audit",
    description:
      "Your team is probably overspending on AI tools. Find out in 2 minutes.",
  },
};

const FEATURES = [
  {
    icon: "🔍",
    title: "Instant Spend Analysis",
    description:
      "Input your AI tools and get a detailed breakdown of where every dollar goes — and where it shouldn't.",
  },
  {
    icon: "💡",
    title: "Actionable Recommendations",
    description:
      "Not vague advice. Specific plan changes, tool swaps, and savings — with dollar amounts and reasoning you can show your CFO.",
  },
  {
    icon: "📊",
    title: "Defensible Numbers",
    description:
      "Every recommendation cites current vendor pricing. The math is transparent, the logic is auditable.",
  },
  {
    icon: "🔗",
    title: "Shareable Reports",
    description:
      "Each audit gets a unique URL you can share with your team or leadership. Clean previews on Twitter and Slack.",
  },
  {
    icon: "🤖",
    title: "AI-Powered Insights",
    description:
      "Get a personalized summary of your spend patterns — written by Claude, grounded in your actual numbers.",
  },
  {
    icon: "💰",
    title: "Credex Savings",
    description:
      "For teams with significant overspend, unlock additional savings through Credex's discounted AI infrastructure credits.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Add Your Tools",
    description: "Select which AI tools you pay for, which plan, and how many seats.",
  },
  {
    number: "02",
    title: "Get Your Audit",
    description: "Our engine analyzes each tool against alternatives, plan fit, and Credex rates.",
  },
  {
    number: "03",
    title: "Save & Share",
    description: "Save your report, share with your team, and start saving immediately.",
  },
];

const TOOLS_SUPPORTED = [
  { name: "Cursor", icon: "⚡" },
  { name: "GitHub Copilot", icon: "🤖" },
  { name: "Claude", icon: "🧠" },
  { name: "ChatGPT", icon: "💬" },
  { name: "Gemini", icon: "✨" },
  { name: "Windsurf", icon: "🏄" },
  { name: "Anthropic API", icon: "🔌" },
  { name: "OpenAI API", icon: "🔧" },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 md:py-32">
        {/* Background gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            Free tool — no login required
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Your AI Tools Are
            <br />
            <span className="bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 bg-clip-text text-transparent">
              Costing Too Much
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
            Most startups overspend on AI subscriptions without knowing it.
            PromptBudget audits your Cursor, Copilot, Claude, and ChatGPT spend
            in 2 minutes — and shows you exactly where to cut.
          </p>

          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/audit"
              className="inline-flex h-14 items-center gap-2 rounded-full bg-foreground px-8 text-lg font-semibold text-background transition-all hover:opacity-90 hover:scale-105 hover:shadow-xl"
            >
              Audit My AI Spend
              <span className="text-xl">→</span>
            </Link>
            <span className="text-sm text-muted-foreground">
              Takes 2 minutes · No signup needed
            </span>
          </div>
        </div>
      </section>

      {/* Supported Tools */}
      <section className="border-y border-border bg-muted/30 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Supports 8 tools and counting
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            {TOOLS_SUPPORTED.map((tool) => (
              <div
                key={tool.name}
                className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <span className="text-xl">{tool.icon}</span>
                <span className="text-sm font-medium">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              Three steps to knowing exactly what your AI stack costs — and what
              it should cost.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.number} className="relative">
                <div className="mb-4 text-5xl font-black text-primary/10">
                  {step.number}
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Built for Engineering Leaders
            </h2>
            <p className="text-lg text-muted-foreground">
              Not another dashboard. A tool that tells you what to do and why.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <ToolCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-8 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Trusted by engineering teams
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                quote: "Found $340/mo in wasted Cursor licenses in 2 minutes.",
                author: "Engineering Manager",
                company: "Series A Startup",
              },
              {
                quote: "We didn't realize our team plan was overkill for 3 devs.",
                author: "CTO",
                company: "Seed Stage",
              },
              {
                quote: "The Credex credits saved us an extra 15% on top.",
                author: "VP Engineering",
                company: "Growth Stage",
              },
            ].map((testimonial) => (
              <div
                key={testimonial.author}
                className="rounded-2xl border border-border bg-card p-6 text-left"
              >
                <p className="mb-4 text-sm italic leading-relaxed text-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.company}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground italic">
            * Testimonials are illustrative examples based on typical audit outcomes
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl rounded-3xl bg-foreground p-12 text-center text-background md:p-16">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Stop Overpaying for AI
          </h2>
          <p className="mb-8 text-lg opacity-80">
            Join hundreds of teams who&apos;ve optimized their AI spend. Free audit, real savings.
          </p>
          <Link
            href="/audit"
            className="inline-flex h-14 items-center gap-2 rounded-full bg-background px-8 text-lg font-semibold text-foreground transition-all hover:opacity-90 hover:scale-105"
          >
            Start Your Free Audit →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-lg">📊</span>
            <span>PromptBudget — powered by</span>
            <a
              href="https://credex.rocks"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-foreground hover:underline"
            >
              Credex
            </a>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Credex. All pricing data sourced from official vendor pages.
          </p>
        </div>
      </footer>
    </div>
  );
}
