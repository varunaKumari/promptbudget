"use client";

import { motion } from "framer-motion";
import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/15 text-primary shadow-sm">
        <Bot className="h-4 w-4" />
      </div>
      <div className="rounded-xl rounded-bl-md border border-border/70 bg-surface-elevated/90 px-3.5 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
              animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
              transition={{
                repeat: Infinity,
                duration: 0.9,
                delay: dot * 0.12,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
