import Link from "next/link";
import { Logo } from "@/components/ui/logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Logo size="sm" href="/" />
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            PromptBudget helps engineering teams audit and optimize their AI tool
            spend. Free forever. No signup required.
          </p>
        </div>

        <div className="flex gap-12 text-sm">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Product
            </p>
            <ul className="space-y-2">
              <li>
                <Link href="/audit" className="text-muted-foreground transition-colors hover:text-foreground">
                  Start Audit
                </Link>
              </li>
              <li>
                <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
                  Credex Credits
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Company
            </p>
            <ul className="space-y-2">
              <li>
                <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-foreground">
                  About Credex
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-border pt-6">
        <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground md:flex-row">
          <span>
            © {new Date().getFullYear()} Credex. All pricing data sourced from official vendor pages.
          </span>
          <span>
            Updated weekly · Data verified May 2026
          </span>
        </div>
      </div>
    </footer>
  );
}
