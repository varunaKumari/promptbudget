"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, MessageSquareText, ReceiptText, Sparkles } from "lucide-react";
import { useChatbot } from "./chatbot-provider";

const DEFAULT_SUGGESTIONS = [
  {
    icon: MessageSquareText,
    label: "What does PromptBudget do?",
    prompt: "What does PromptBudget do and how should I use it?",
  },
  {
    icon: ReceiptText,
    label: "How are savings calculated?",
    prompt: "How does PromptBudget calculate savings?",
  },
  {
    icon: BarChart3,
    label: "Help me optimize spend",
    prompt: "Help me think through my AI tool budget.",
  },
];

const AUDIT_SUGGESTIONS = [
  {
    icon: Sparkles,
    label: "Explain my report",
    prompt: "Explain my audit report in plain English.",
  },
  {
    icon: BarChart3,
    label: "Top next step",
    prompt: "What is the highest-impact next step from this report?",
  },
  {
    icon: ReceiptText,
    label: "Draft CFO summary",
    prompt: "Draft a concise summary of this report for my CFO.",
  },
];

export function ChatSuggestions() {
  const { sendMessage, auditId } = useChatbot();
  const suggestions = auditId ? AUDIT_SUGGESTIONS : DEFAULT_SUGGESTIONS;

  return (
    <div className="flex min-h-full flex-col justify-center px-1">
      <motion.div
        className="mb-5 overflow-hidden rounded-xl border border-border/75 bg-surface-elevated p-5 shadow-[0_12px_40px_oklch(0_0_0_/_7%)]"
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary shadow-inner">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight">AI spend copilot</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Ask for recommendations, report summaries, or a CFO-ready explanation.
            </p>
          </div>
        </div>
        <div className="rounded-lg border border-border/60 bg-muted/35 px-3 py-2 text-xs text-muted-foreground">
          Context-aware on audit pages. Private to this session unless you save it.
        </div>
      </motion.div>
      <div className="grid gap-2">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon;
          return (
            <motion.button
              key={suggestion.prompt}
              type="button"
              onClick={() => void sendMessage(suggestion.prompt)}
              className="group flex items-center justify-between gap-3 rounded-lg border border-border/80 bg-surface-elevated px-3 py-3 text-left text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:bg-muted hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/35"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground/85 transition-colors group-hover:text-primary" />
                <span className="font-medium">{suggestion.label}</span>
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
