"use client";

import { ReactNode, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function MarkdownMessage({
  content,
  isUser,
}: {
  content: string;
  isUser: boolean;
}) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
        ul: ({ children }) => (
          <ul className="mb-2 list-disc space-y-1 pl-4 last:mb-0">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="mb-2 list-decimal space-y-1 pl-4 last:mb-0">{children}</ol>
        ),
        a: ({ children, href }) => (
          <a
            href={safeHref(href)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "font-medium underline underline-offset-4",
              isUser ? "text-primary-foreground" : "text-primary"
            )}
          >
            {children}
          </a>
        ),
        code: ({ children }) => (
          <code
            className={cn(
              "rounded border px-1 py-0.5 font-mono text-[0.78em]",
              isUser
                ? "border-primary-foreground/20 bg-primary-foreground/12"
                : "border-border bg-muted"
            )}
          >
            {children}
          </code>
        ),
        pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

function safeHref(href: string | undefined): string {
  if (!href) return "#";
  if (/^(https?:|mailto:)/i.test(href)) return href;
  return "#";
}

function CodeBlock({ children }: { children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const text = extractText(children);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="group/code relative mb-2 last:mb-0">
      <pre className="chat-scrollbar overflow-x-auto rounded-md border border-border bg-muted p-3 pr-10 text-xs">
        {children}
      </pre>
      <button
        type="button"
        aria-label="Copy code"
        onClick={copy}
        className="absolute right-2 top-2 rounded border border-border bg-background/80 p-1 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover/code:opacity-100"
      >
        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      </button>
    </div>
  );
}

function extractText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return extractText(props?.children);
  }
  return "";
}
