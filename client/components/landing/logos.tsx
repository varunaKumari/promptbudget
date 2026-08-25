"use client";

import { Bot, Brain, Code2, MessageSquare, Sparkles, Terminal, Zap } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

const TOOLS = [
  { name: "Cursor", icon: Code2 },
  { name: "GitHub Copilot", icon: Bot },
  { name: "Claude", icon: Brain },
  { name: "ChatGPT", icon: MessageSquare },
  { name: "Gemini", icon: Sparkles },
  { name: "Windsurf", icon: Zap },
  { name: "Replit", icon: Terminal },
];

export function LandingLogos() {
  return (
    <section className="border-b border-border bg-background px-5 py-9 md:px-8">
      <FadeIn className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Analyzes popular AI tools and API platforms
          </p>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            {TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.name} className="flex items-center gap-2 text-muted-foreground">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tool.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
