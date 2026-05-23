import { Navbar } from "@/components/navbar";
import { LoadingRows } from "./metric-card";

export function DashboardLoading({ label = "Loading dashboard" }: { label?: string }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 md:py-12 lg:px-8">
        <div className="max-w-3xl">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="mt-5 h-12 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-4 h-5 w-full animate-pulse rounded bg-muted" />
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label={label}>
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="h-44 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="mt-8 rounded-xl border border-border bg-card p-5">
          <LoadingRows />
        </div>
      </main>
    </div>
  );
}
