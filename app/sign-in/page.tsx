import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to PromptBudget to manage AI spend audits and reports.",
};

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <div className="flex items-center justify-between px-6 py-10 sm:px-10 lg:px-16">
        <Logo size="lg" href="/" />
        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/audit" className="text-black/60 transition-colors hover:text-black">
            Audit
          </Link>
          <Link href="/sign-out" className="text-black/60 transition-colors hover:text-black">
            Sign out
          </Link>
        </div>
      </div>
      <section className="flex min-h-[calc(100vh-150px)] items-center justify-center px-6 pb-20">
        <SignInForm />
      </section>
    </main>
  );
}
