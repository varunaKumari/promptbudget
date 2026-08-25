import type { Metadata } from "next";
import { Award, ShieldCheck, Sparkles } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Contact",
  description: "Request a PromptBudget demo or talk with the team.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-[#070a12] dark:text-white">
      <Navbar showAuditCta={false} />
      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[12%] top-8 h-[360px] w-[520px] rounded-full bg-blue-500/8 blur-[115px] dark:bg-blue-500/12" />
          <div className="absolute bottom-0 right-0 h-[360px] w-[520px] rounded-full bg-cyan-400/5 blur-[120px] dark:bg-cyan-400/8" />
        </div>

        <section className="relative mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_520px] lg:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground dark:border-white/10 dark:bg-white/[0.04] dark:text-white/64">
              <Sparkles className="h-3.5 w-3.5 text-blue-300" />
              Demo request
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
              See exactly where AI spend is leaking.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground dark:text-white/58">
              Tell us about your team and we&apos;ll help you benchmark subscriptions, identify duplicated seats, and build a clean savings plan.
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { icon: ShieldCheck, label: "Secure review" },
                { icon: Award, label: "CFO-ready report" },
                { icon: Sparkles, label: "Fast setup" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border bg-card px-4 py-4 text-sm font-semibold text-muted-foreground shadow-sm dark:border-white/10 dark:bg-white/[0.035] dark:text-white/72"
                  >
                    <Icon className="mb-3 h-5 w-5 text-blue-300" />
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>

          <ContactForm />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
