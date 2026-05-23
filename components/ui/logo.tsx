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
      <path
        d="M5 21.5V6.5h9.4c4.6 0 7.6 2.4 7.6 6.1 0 3.8-3 6.2-7.6 6.2H9.7v2.7H5Z"
        className="fill-foreground"
      />
      <path
        d="M9.7 10.2v4.9h4.4c1.9 0 3.1-.9 3.1-2.5s-1.2-2.4-3.1-2.4H9.7Z"
        className="fill-primary"
      />
      <path
        d="M18.5 20.8c2.1-.8 3.8-2.1 5-4"
        className="stroke-primary"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
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
        <span className={`font-semibold tracking-normal ${s.text}`}>
          PromptBudget
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <Link href={href} className="flex items-center gap-2 transition-opacity hover:opacity-75">
        {content}
      </Link>
    );
  }

  return content;
}
