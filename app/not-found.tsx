import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 text-8xl font-black text-muted-foreground/20">
        404
      </div>
      <h1 className="mb-3 text-2xl font-bold">Audit Not Found</h1>
      <p className="mb-8 max-w-md text-muted-foreground">
        This audit report doesn&apos;t exist or has been removed. Run a new
        audit to get fresh savings recommendations.
      </p>
      <Link
        href="/audit"
        className="inline-flex h-12 items-center rounded-full bg-foreground px-8 font-medium text-background transition-all hover:opacity-90 hover:scale-105"
      >
        Start New Audit →
      </Link>
    </div>
  );
}
