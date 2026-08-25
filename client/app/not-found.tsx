import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Logo size="lg" href="/" showText={false} />
      <div className="mt-8 mb-4 text-7xl font-black text-muted-foreground/15 font-tabular">
        404
      </div>
      <h1 className="mb-2 text-xl font-bold">Page not found</h1>
      <p className="mb-8 max-w-sm text-sm text-muted-foreground">
        This page doesn&apos;t exist or the audit report has expired.
        Run a new audit to get fresh savings recommendations.
      </p>
      <Link
        href="/audit"
        className="group inline-flex h-10 items-center rounded-lg bg-foreground px-6 text-sm font-medium text-background transition-all hover:opacity-90"
      >
        Start new audit
        <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}
