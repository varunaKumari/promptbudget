import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background px-5 py-10 md:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1fr_auto_auto]">
        <div>
          <Logo size="sm" href="/" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            PromptBudget helps engineering teams explain and optimize AI spend
            across seats, plans, and API usage.
          </p>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Product
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/audit" className="text-muted-foreground transition-colors hover:text-foreground">
                Start audit
              </Link>
            </li>
            <li>
              <Link href="/#benchmarks" className="text-muted-foreground transition-colors hover:text-foreground">
                Benchmarks
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Company
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://credex.rocks"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Credex
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
        <span>Copyright {new Date().getFullYear()} Credex. All rights reserved.</span>
        <span>Pricing data sourced from official vendor pages. Verified May 2026.</span>
      </div>
    </footer>
  );
}
