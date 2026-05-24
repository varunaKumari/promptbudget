import type { Metadata } from "next";
import Link from "next/link";
import { ModernAuthForm } from "@/components/auth/modern-auth-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your PromptBudget account.",
};

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background text-foreground dark:bg-[#070a12] dark:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[110px] dark:bg-blue-500/14" />
        <div className="absolute bottom-0 left-0 h-[360px] w-[520px] rounded-full bg-indigo-400/6 blur-[120px] dark:bg-indigo-400/8" />
      </div>
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
        <Logo size="lg" href="/" />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-all hover:bg-muted dark:border-white/12 dark:bg-white/[0.04] dark:text-white/78 dark:hover:border-white/24 dark:hover:bg-white/[0.08] dark:hover:text-white"
          >
            Log in
          </Link>
        </div>
      </header>
      <section className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-5 pb-8">
        <ModernAuthForm mode="signup" />
      </section>
    </main>
  );
}
