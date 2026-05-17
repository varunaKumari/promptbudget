"use client";

import { FadeIn } from "@/components/ui/motion";

const TOOLS = [
  { name: "Cursor", icon: "⚡" },
  { name: "GitHub Copilot", icon: "🤖" },
  { name: "Claude", icon: "🧠" },
  { name: "ChatGPT", icon: "💬" },
  { name: "Gemini", icon: "✨" },
  { name: "Windsurf", icon: "🏄" },
  { name: "v0", icon: "▲" },
  { name: "Replit", icon: "🔄" },
  { name: "Anthropic API", icon: "🔌" },
  { name: "OpenAI API", icon: "🔧" },
];

export function LandingLogos() {
  return (
    <section className="border-y border-border bg-surface px-6 py-10">
      <FadeIn className="mx-auto max-w-6xl">
        <p className="mb-5 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Analyzes 10 tools across 40+ pricing plans
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {TOOLS.map((tool) => (
            <div
              key={tool.name}
              className="flex items-center gap-1.5 text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              <span className="text-base">{tool.icon}</span>
              <span className="text-sm font-medium">{tool.name}</span>
            </div>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
