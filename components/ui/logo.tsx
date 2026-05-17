import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  href?: string;
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Three bars forming a chart — the "P" in PromptBudget */}
      <rect x="3" y="16" width="6" height="10" rx="1.5" className="fill-primary" />
      <rect x="11" y="8" width="6" height="18" rx="1.5" className="fill-primary opacity-70" />
      <rect x="19" y="2" width="6" height="24" rx="1.5" className="fill-primary opacity-40" />
      {/* Subtle cut line representing "budget" */}
      <line x1="1" y1="14" x2="27" y2="14" className="stroke-danger" strokeWidth="1.5" strokeDasharray="2 2" strokeLinecap="round" />
    </svg>
  );
}

const sizeMap = {
  sm: { mark: "h-5 w-5", text: "text-sm" },
  md: { mark: "h-6 w-6", text: "text-lg" },
  lg: { mark: "h-8 w-8", text: "text-xl" },
};

export function Logo({ size = "md", showText = true, href = "/" }: LogoProps) {
  const s = sizeMap[size];

  const content = (
    <span className="flex items-center gap-2">
      <LogoMark className={s.mark} />
      {showText && (
        <span className={`font-bold tracking-tight ${s.text}`}>
          Prompt<span className="text-primary">Budget</span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-2 transition-opacity hover:opacity-80">
        {content}
      </Link>
    );
  }

  return content;
}
